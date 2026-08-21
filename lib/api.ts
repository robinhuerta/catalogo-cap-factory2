const API_URL = import.meta.env.VITE_API_URL as string;

export interface DBProject {
  id: string;
  cliente: string;
  imagen: string;
  industria: string;
  tecnica: string;
  cantidad: number;
  detalles: string;
  frase: string;
  activo: boolean;
  orden: number;
  created_at: string;
}

export interface DBProduct {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  descripcion: string;
  moq: number;
  entrega: string;
  precio: string;
  precio_antes: string;
  tags: string[];
  imagenes: string[];
  tela: string;
  bordado: string;
  visera: string;
  broche: string;
  acabados: string;
  activo: boolean;
  orden: number;
  created_at: string;
}

export type BordadoPosicion = 'frontal' | 'lateral_izquierdo' | 'lateral_derecho' | 'posterior';

export interface EstadoBordado {
  requerido: boolean;
  listo: boolean;
}

export type BordadosPorPosicion = Partial<Record<BordadoPosicion, EstadoBordado>>;

export interface PedidoItem {
  diseno: string;
  color: string;
  tela: string;
  cantidad: number;
  tecnica: string;
  bastidor: string;
  colores_maquina: number;
  numero_colores: number;
  colores_hilo: string;
  color_jebe: string;
  imagen: string;
  notas: string;
  lote: string;
  corte: boolean;
  confeccion: boolean;
  bordado: boolean;
  /**
   * Control de producción por ubicación. `bordado` se mantiene para que los
   * pedidos antiguos sigan funcionando mientras se pasan a este nuevo flujo.
   */
  bordados?: BordadosPorPosicion;
}

export interface DBPedido {
  id: string;
  cliente: string;
  telefono: string;
  fecha_pedido: string;
  fecha_entrega: string;
  estado: 'nuevo' | 'produccion' | 'listo' | 'entregado' | 'cancelado';
  notas: string;
  items: PedidoItem[];
  activo: boolean;
  orden: number;
  created_at: string;
}

type Table = 'products' | 'projects' | 'pedidos';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

function authHeaders(password: string) {
  return { 'X-Admin-Password': password };
}

export const api = {
  list: (table: Table, all = false, password?: string) =>
    request(`/api/${table}${all ? '?all=1' : ''}`, password ? { headers: authHeaders(password) } : undefined),

  create: <T>(table: Table, payload: T, password: string) =>
    request(`/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify(payload),
    }),

  update: <T>(table: Table, id: string, payload: Partial<T>, password: string) =>
    request(`/api/${table}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(password) },
      body: JSON.stringify(payload),
    }),

  remove: (table: Table, id: string, password: string) =>
    request(`/api/${table}/${id}`, { method: 'DELETE', headers: authHeaders(password) }),

  upload: async (file: File, password: string): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: authHeaders(password),
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  },
};
