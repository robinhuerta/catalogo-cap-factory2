import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_KEY as string;

export const supabase = createClient(url, key);

export interface DBProduct {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  descripcion: string;
  moq: number;
  entrega: string;
  precio: string;
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
