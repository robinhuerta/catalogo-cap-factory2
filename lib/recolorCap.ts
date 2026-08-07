// Recolorea una foto de gorra (fondo claro, gorra oscura) a un color arbitrario,
// preservando el sombreado/brillo original y quitando el fondo — incluyendo
// sombras proyectadas separadas de la gorra (ej. la sombra sobre la mesa).
// El color y ancho del fondo se detectan por imagen (no se asume blanco puro).

let cachedSrc: string | null = null;
let cachedImg: HTMLImageElement | null = null;
let cachedCanvas: HTMLCanvasElement | null = null;
let cachedMask: { connected: Uint8Array; lum: Float32Array; min: number; max: number; threshold: number; feather: number } | null = null;

const SHADE_AMPLITUDE = 24; // puntos de luminosidad (HSL) entre sombra y brillo
const MIN_LIGHTNESS = 4;
const MAX_LIGHTNESS = 96;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToHsl(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number) {
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Estima la luminancia del fondo a partir del borde de la imagen (percentil alto,
// para que una franja de sombra tocando el borde no baje la estimación).
function estimateBackgroundLum(lum: Float32Array, width: number, height: number): number {
  const samples: number[] = [];
  for (let x = 0; x < width; x++) {
    samples.push(lum[x]);
    samples.push(lum[(height - 1) * width + x]);
  }
  for (let y = 0; y < height; y++) {
    samples.push(lum[y * width]);
    samples.push(lum[y * width + width - 1]);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length * 0.85)];
}

// Encuentra la gorra como la región más grande de píxeles claramente distintos
// del fondo (componente conexa de mayor tamaño), para descartar regiones
// desconectadas más chicas como sombras proyectadas o ruido.
function findConnectedCap(lum: Float32Array, width: number, height: number, threshold: number): Uint8Array {
  const isCandidate = (i: number) => lum[i] < threshold;
  const n = width * height;
  const label = new Int32Array(n);
  const queue = new Int32Array(n);
  const sizes: number[] = [0]; // índice 0 sin usar

  for (let start = 0; start < n; start++) {
    if (label[start] !== 0 || !isCandidate(start)) continue;
    const id = sizes.length;
    sizes.push(0);
    let qHead = 0, qTail = 0;
    label[start] = id;
    queue[qTail++] = start;
    while (qHead < qTail) {
      const i = queue[qHead++];
      sizes[id]++;
      const x = i % width;
      const y = (i - x) / width;
      if (x > 0 && label[i - 1] === 0 && isCandidate(i - 1)) { label[i - 1] = id; queue[qTail++] = i - 1; }
      if (x < width - 1 && label[i + 1] === 0 && isCandidate(i + 1)) { label[i + 1] = id; queue[qTail++] = i + 1; }
      if (y > 0 && label[i - width] === 0 && isCandidate(i - width)) { label[i - width] = id; queue[qTail++] = i - width; }
      if (y < height - 1 && label[i + width] === 0 && isCandidate(i + width)) { label[i + width] = id; queue[qTail++] = i + width; }
    }
  }

  let largestId = 0, largestSize = 0;
  for (let id = 1; id < sizes.length; id++) {
    if (sizes[id] > largestSize) { largestSize = sizes[id]; largestId = id; }
  }

  const connected = new Uint8Array(n);
  if (largestId > 0) {
    for (let i = 0; i < n; i++) connected[i] = label[i] === largestId ? 1 : 0;
  }
  return connected;
}

function buildMask(data: Uint8ClampedArray, width: number, height: number) {
  const n = width * height;
  const lum = new Float32Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  const bgLum = estimateBackgroundLum(lum, width, height);
  const threshold = Math.max(30, bgLum - 12);
  const feather = Math.min(18, Math.max(4, threshold * 0.3));

  const connected = findConnectedCap(lum, width, height, threshold);

  let min = 255, max = 0;
  for (let i = 0; i < n; i++) {
    if (connected[i] && lum[i] < threshold - feather) {
      if (lum[i] < min) min = lum[i];
      if (lum[i] > max) max = lum[i];
    }
  }
  return { connected, lum, min, max, threshold, feather };
}

export async function recolorCap(src: string, hex: string): Promise<string> {
  if (cachedSrc !== src) {
    cachedImg = await loadImage(src);
    cachedCanvas = document.createElement('canvas');
    cachedCanvas.width = cachedImg.naturalWidth;
    cachedCanvas.height = cachedImg.naturalHeight;
    cachedMask = null;
    cachedSrc = src;
  }
  const canvas = cachedCanvas!;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cachedImg!, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (!cachedMask) {
    cachedMask = buildMask(data, canvas.width, canvas.height);
  }
  const { connected, lum, min, max, threshold, feather } = cachedMask;
  const span = Math.max(max - min, 1);
  const { h, s, l: baseL } = hexToHsl(hex);

  // Cache de color por nivel de sombra (256 escalones) para no recalcular HSL->RGB por píxel.
  const shadeCache = new Map<number, { r: number; g: number; b: number }>();

  for (let i = 0, p = 0; p < data.length; i++, p += 4) {
    let alpha = 0;
    if (connected[i]) {
      const l0 = lum[i];
      if (l0 < threshold - feather) {
        alpha = 255;
      } else if (l0 < threshold) {
        alpha = 255 * (1 - (l0 - (threshold - feather)) / feather);
      }
    }

    if (alpha > 0) {
      const shade = Math.min(1, Math.max(0, (lum[i] - min) / span));
      const bucket = Math.round(shade * 255);
      let rgb = shadeCache.get(bucket);
      if (!rgb) {
        const delta = (shade - 0.5) * 2 * SHADE_AMPLITUDE;
        const l = Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, baseL + delta));
        rgb = hslToRgb(h, s, l);
        shadeCache.set(bucket, rgb);
      }
      data[p] = rgb.r;
      data[p + 1] = rgb.g;
      data[p + 2] = rgb.b;
    }
    data[p + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
