
import { CapProduct, ClientProject, TechInnovation } from './types';

/**
 * 🛠️ CONFIGURACIÓN GLOBAL
 */
export const GLOBAL_CONFIG = {
  WHATSAPP_NUMBER: "51999999999", // Cambiar por el número real
  COMPANY_NAME: "Cap Factory Perú",
  MESSAGE_PREFIX: "Hola, Cap Factory. Me gustaría solicitar una cotización por los siguientes modelos de muestra:\n\n"
};

/**
 * 🚀 CONFIGURACIÓN DE CATÁLOGO COMPLETO
 * ----------------------------------------------------------------
 * He restaurado las 6 categorías principales de tu fábrica.
 * Puedes cambiar las URLs de Unsplash por tus fotos locales: "./images/tu-foto.jpg"
 * ----------------------------------------------------------------
 */

export const CAPS_DATA: CapProduct[] = [
  {
    id: "1",
    nombre: "Pro-Snap Clásica",
    categoria: "Snapback (Plana)",
    imagen: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800",
    descripcion: "Estructura rígida de 6 paneles con corona alta. El estándar de oro para el estilo urbano internacional.",
    moq: 50,
    entrega: "15-18 días",
    tags: ["Premium", "Bordado 3D"],
    precio: "Desde S/ 25.00",
    fichaTecnica: {
      tela: "Acrílico/Lana de alta densidad",
      bordado: "Frontal 3D (Relieve) de 5mm",
      visera: "Plana con 8 filas de costura",
      broche: "Snapback de PVC reforzado",
      acabados: "Etiquetas tejidas de alta definición"
    }
  },
  {
    id: "2",
    nombre: "Trucker de Malla Pro",
    categoria: "Trucker (Malla)",
    imagen: "https://images.unsplash.com/photo-1595433707802-6806f3f04f0d?auto=format&fit=crop&q=80&w=800",
    descripcion: "Combinación de frente acolchado y malla transpirable. Perfecta para climas cálidos y estilos retro.",
    moq: 100,
    entrega: "12-15 días",
    tags: ["Más Vendida", "Transpirable"],
    fichaTecnica: {
      tela: "Espuma bondeada + Malla de Nylon",
      bordado: "Parche de cuero grabado a láser",
      visera: "Curva pre-hormada",
      broche: "Snapback estándar",
      acabados: "Banda antisudor de algodón absorbente"
    }
  },
  {
    id: "3",
    nombre: "Vintage Dad Hat",
    categoria: "Daddy (Curva)",
    imagen: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&q=80&w=800",
    descripcion: "Silueta desestructurada de bajo perfil. Un clásico atemporal con acabado lavado a la piedra.",
    moq: 50,
    entrega: "18-22 días",
    tags: ["Vintage", "Algodón"],
    fichaTecnica: {
      tela: "100% Algodón Drill Lavado",
      bordado: "Bordado plano minimalista",
      visera: "Súper curva flexible",
      broche: "Hebilla metálica",
      acabados: "Efecto gastado artesanal"
    }
  },
  {
    id: "4",
    nombre: "Street 5-Panel",
    categoria: "5 Paneles",
    imagen: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800",
    descripcion: "Estilo moderno y cuadrado, inspirado en la cultura skate. Perfil bajo y construcción técnica.",
    moq: 50,
    entrega: "20-25 días",
    tags: ["Skater", "Minimalista"],
    fichaTecnica: {
      tela: "Nylon Ripstop o Canvas",
      bordado: "Parche tejido frontal",
      visera: "Plana corta",
      broche: "Cinta de nylon con clip plástico",
      acabados: "Ojalillos metálicos laterales"
    }
  },
  {
    id: "5",
    nombre: "Performance Dry-Fit",
    categoria: "Deportivas",
    imagen: "https://images.unsplash.com/photo-1534215754734-18e2973b7d80?auto=format&fit=crop&q=80&w=800",
    descripcion: "Diseñada para alto rendimiento. Tela ligera que expulsa el sudor y mantiene la frescura.",
    moq: 150,
    entrega: "15-18 días",
    tags: ["Deporte", "Ligera"],
    fichaTecnica: {
      tela: "Poliéster Microfibra Dry-Fit",
      bordado: "Transfer de vinilo reflectivo",
      visera: "Curva ultra-ligera",
      broche: "Velcro elástico",
      acabados: "Costuras termoselladas"
    }
  },
  {
    id: "6",
    nombre: "Campaña Express",
    categoria: "Publicitarias",
    imagen: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800",
    descripcion: "La mejor relación calidad-precio para eventos masivos y campañas de marketing de gran escala.",
    moq: 500,
    entrega: "10-12 días",
    tags: ["Económica", "Masivo"],
    fichaTecnica: {
      tela: "Polialgodón estándar",
      bordado: "Estampado en serigrafía o bordado simple",
      visera: "Curva estándar",
      broche: "Cierre de plástico simple",
      acabados: "Colores institucionales básicos"
    }
  }
];

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "CP1",
    cliente: "Tu Primer Cliente",
    imagen: "https://images.unsplash.com/photo-1533923156502-be31530547c4?auto=format&fit=crop&q=80&w=800",
    tipo: "Colección Exclusiva",
    detalles: "Producción de 1000 unidades con acabados premium para marca de retail local."
  }
];

export const TECH_INNOVATIONS: TechInnovation[] = [
  {
    id: "TECH-01",
    titulo: "Bordado 3D Premium",
    descripcion: "Nuestra técnica insignia para logos que destacan con relieve real de alta densidad.",
    imagen: "https://images.unsplash.com/photo-1621330396173-e41b18717551?auto=format&fit=crop&q=80&w=800",
    especificacion: "Relieve de hasta 6mm",
    beneficio: "Impacto visual máximo"
  }
];

export const CATEGORIES: string[] = ['Todas', ...new Set(CAPS_DATA.map(cap => cap.categoria))];
