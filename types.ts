
export interface FichaTecnica {
  tela: string;
  bordado: string;
  visera: string;
  broche: string;
  acabados: string;
}

export interface CapProduct {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  imagenes?: string[];
  descripcion: string;
  fichaTecnica: FichaTecnica;
  moq: number;
  entrega: string;
  tags: string[];
  precio?: string;
  precio_antes?: string;
}

export interface ClientProject {
  id: string;
  cliente: string;
  imagen: string;
  industria: 'Restaurantes' | 'Deportes' | 'Corporativo' | 'Eventos' | 'Retail';
  tecnica: string;
  cantidad: number;
  detalles: string;
  frase?: string;
}

export interface TechInnovation {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  especificacion: string;
  beneficio: string;
}

export type Category = string;
export type ViewMode = 'home' | 'catalog' | 'portfolio' | 'technology' | 'b2b' | 'configurador';

export interface QuoteItem extends CapProduct {
  timestamp: number;
  quantity: number;
  color?: string;
}
