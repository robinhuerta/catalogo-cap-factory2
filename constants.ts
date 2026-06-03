
import { CapProduct, ClientProject, TechInnovation } from './types';

/**
 * 🛠️ CONFIGURACIÓN GLOBAL
 */
export const GLOBAL_CONFIG = {
  WHATSAPP_NUMBER: "51930404573",
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
    cliente: "Bembos",
    imagen: "https://images.unsplash.com/photo-1588453251771-cd919b362ed4?auto=format&fit=crop&q=80&w=800",
    industria: "Restaurantes",
    tecnica: "Bordado 3D + etiqueta interna",
    cantidad: 500,
    detalles: "Gorras de uniforme para todo el personal de tienda a nivel nacional.",
    frase: "Entrega puntual y calidad uniforme en todas las unidades."
  },
  {
    id: "CP2",
    cliente: "Liga Universitaria Lima",
    imagen: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?auto=format&fit=crop&q=80&w=800",
    industria: "Deportes",
    tecnica: "Bordado plano + sublimación visera",
    cantidad: 300,
    detalles: "Colección para equipos de fútbol y básquet del torneo interuniversitario.",
  },
  {
    id: "CP3",
    cliente: "Interbank",
    imagen: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800",
    industria: "Corporativo",
    tecnica: "Bordado 3D + parche de cuero",
    cantidad: 1200,
    detalles: "Merchandising corporativo para campaña de fidelización de clientes premium.",
    frase: "El parche de cuero le dio un nivel que no esperábamos."
  },
  {
    id: "CP4",
    cliente: "Festival Selvámonos",
    imagen: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    industria: "Eventos",
    tecnica: "Estampado cesgo + placa metálica",
    cantidad: 800,
    detalles: "Gorras oficiales de edición limitada para el festival de música en la selva.",
    frase: "Se agotaron antes de que termine el primer día."
  },
  {
    id: "CP5",
    cliente: "Ripley Perú",
    imagen: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800",
    industria: "Retail",
    tecnica: "Bordado 3D + etiqueta + cesgo",
    cantidad: 2000,
    detalles: "Colección cápsula para temporada verano, distribuida en todas las tiendas del país.",
  },
  {
    id: "CP6",
    cliente: "La Italiana",
    imagen: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&q=80&w=800",
    industria: "Restaurantes",
    tecnica: "Bordado plano + etiqueta personalizada",
    cantidad: 200,
    detalles: "Gorras de chef y atención al cliente para cadena de restaurantes.",
  },
  {
    id: "CP7",
    cliente: "Club Regatas Lima",
    imagen: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
    industria: "Deportes",
    tecnica: "Bordado 3D + PVC lateral",
    cantidad: 600,
    detalles: "Colección deportiva para socios del club, incluyendo línea de natación y remo.",
    frase: "La calidad está a la altura del club."
  },
  {
    id: "CP8",
    cliente: "Startup Summit Perú",
    imagen: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
    industria: "Eventos",
    tecnica: "Bordado plano + parche woven",
    cantidad: 400,
    detalles: "Kit de bienvenida para los 400 asistentes del evento tech más grande del año.",
  },
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
