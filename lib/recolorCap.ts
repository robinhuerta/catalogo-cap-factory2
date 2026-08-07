// Recolorea una foto de gorra (fondo claro, gorra oscura) a un color arbitrario,
// preservando el sombreado/brillo original y quitando el fondo.

let cachedSrc: string | null = null;
let cachedImg: HTMLImageElement | null = null;
let cachedCanvas: HTMLCanvasElement | null = null;
let cachedLumRange: { min: number; max: number } | null = null;

const BG_THRESHOLD = 232; // luminancia a partir de la cual se considera fondo
const BG_FEATHER = 18; // ancho del borde suavizado (antialiasing)
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

export async function recolorCap(src: string, hex: string): Promise<string> {
  if (cachedSrc !== src) {
    cachedImg = await loadImage(src);
    cachedCanvas = document.createElement('canvas');
    cachedCanvas.width = cachedImg.naturalWidth;
    cachedCanvas.height = cachedImg.naturalHeight;
    cachedLumRange = null;
    cachedSrc = src;
  }
  const canvas = cachedCanvas!;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cachedImg!, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (!cachedLumRange) {
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < BG_THRESHOLD - BG_FEATHER) {
        if (lum < min) min = lum;
        if (lum > max) max = lum;
      }
    }
    cachedLumRange = { min, max };
  }
  const { min, max } = cachedLumRange;
  const span = Math.max(max - min, 1);
  const { h, s, l: baseL } = hexToHsl(hex);

  // Cache de color por nivel de sombra (256 escalones) para no recalcular HSL->RGB por píxel.
  const shadeCache = new Map<number, { r: number; g: number; b: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    let alpha = 255;
    if (lum >= BG_THRESHOLD) {
      alpha = 0;
    } else if (lum > BG_THRESHOLD - BG_FEATHER) {
      alpha = 255 * (1 - (lum - (BG_THRESHOLD - BG_FEATHER)) / BG_FEATHER);
    }

    if (alpha > 0) {
      const shade = Math.min(1, Math.max(0, (lum - min) / span));
      const bucket = Math.round(shade * 255);
      let rgb = shadeCache.get(bucket);
      if (!rgb) {
        const delta = (shade - 0.5) * 2 * SHADE_AMPLITUDE;
        const l = Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, baseL + delta));
        rgb = hslToRgb(h, s, l);
        shadeCache.set(bucket, rgb);
      }
      data[i] = rgb.r;
      data[i + 1] = rgb.g;
      data[i + 2] = rgb.b;
    }
    data[i + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
