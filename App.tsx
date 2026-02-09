
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import CapCard from './components/CapCard';
import Lightbox from './components/Lightbox';
import QuoteDrawer from './components/QuoteDrawer';
import { CAPS_DATA, CATEGORIES, CLIENT_PROJECTS, TECH_INNOVATIONS } from './constants';
import { CapProduct, Category, QuoteItem, ViewMode } from './types';

const MARQUEE_IMAGES = [
  "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1595433707802-6806f3f04f0d?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1534215754734-18e2973b7d80?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400",
];

const B2B_BENEFITS = [
  {
    id: 'b1',
    title: 'Tiempos de Entrega Prioritarios',
    short: 'Entregas garantizadas en plazos récord para pedidos de alto volumen.',
    details: 'Contamos con líneas de producción dedicadas exclusivamente a pedidos corporativos. Esto nos permite reducir los tiempos de entrega estándar en un 30%, asegurando que tu mercadería llegue a tiempo para lanzamientos, eventos críticos o reposición de inventario en temporadas altas.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'b2',
    title: 'Marca Blanca de Lujo (Private Label)',
    short: 'Personalización total desde etiquetas internas hasta empaques de retail.',
    details: 'No solo bordamos tu logo. Desarrollamos una experiencia de marca completa: etiquetas de satín tejidas, cintas de costura grabadas, forros interiores premium y empaques individuales personalizados. Transformamos una gorra base en un producto de retail de alta gama listo para la venta.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'b3',
    title: 'Escalabilidad y Precios Tier',
    short: 'Estructura de costos dinámica que premia tu volumen de crecimiento.',
    details: 'Nuestra arquitectura de precios está diseñada para socios estratégicos. A medida que tu volumen anual aumenta, tus márgenes de beneficio se expanden gracias a nuestros descuentos agresivos por niveles (desde 500 hasta 50,000 unidades) y condiciones de pago preferenciales.',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    id: 'b4',
    title: 'Logística Global Certificada',
    short: 'Gestión integral de exportación y despacho a tus almacenes mundiales.',
    details: 'Nos encargamos de toda la complejidad logística. Desde la gestión de aduanas y documentación de exportación desde Perú hasta el transporte multimodal (aéreo o marítimo) con tracking en tiempo real directamente hasta tu centro de distribución en cualquier continente.',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCap, setSelectedCap] = useState<CapProduct | null>(null);
  const [quoteList, setQuoteList] = useState<QuoteItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>('b1');

  useEffect(() => {
    const saved = localStorage.getItem('cf_quote_list');
    if (saved) {
      try { setQuoteList(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cf_quote_list', JSON.stringify(quoteList));
  }, [quoteList]);

  const addToQuote = (cap: CapProduct) => {
    if (quoteList.find(item => item.id === cap.id)) {
      setIsDrawerOpen(true);
      return;
    }
    setQuoteList([...quoteList, { ...cap, timestamp: Date.now() }]);
    setIsDrawerOpen(true);
  };

  const removeFromQuote = (id: string) => {
    setQuoteList(quoteList.filter(item => item.id !== id));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (viewMode !== 'catalog') {
      setViewMode('catalog');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const filteredCaps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CAPS_DATA.filter((cap) => {
      const matchesCategory = activeCategory === 'Todas' || cap.categoria === activeCategory;
      if (!q) return matchesCategory;

      const matchesName = cap.nombre.toLowerCase().includes(q);
      const matchesDesc = cap.descripcion.toLowerCase().includes(q);
      const matchesCat = cap.categoria.toLowerCase().includes(q);
      const matchesTags = cap.tags.some(tag => tag.toLowerCase().includes(q));
      
      return matchesCategory && (matchesName || matchesDesc || matchesCat || matchesTags);
    });
  }, [activeCategory, searchQuery]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setViewMode('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col transition-all duration-700 bg-white">
      <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] py-2 text-center">
        Producción Industrial de Gorras • Envíos Globales • Calidad de Exportación
      </div>

      <Header 
        onOpenQuote={() => setIsDrawerOpen(true)} 
        quoteCount={quoteList.length} 
        activeView={viewMode}
        onSetView={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
      />
      
      <main className="flex-grow">
        {viewMode === 'home' && (
          <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-20">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10 mb-20">
               <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-10 duration-1000 order-2 lg:order-1">
                <div className="w-full max-w-sm">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mb-6 pl-1">Archivo de Producción</p>
                  {CATEGORIES.filter(c => c !== 'Todas').map((cat, idx) => (
                    <button 
                      key={cat} 
                      onClick={() => handleCategoryClick(cat)} 
                      className="group w-full flex items-center justify-start py-4 border-b border-gray-100 hover:border-black transition-all duration-500 text-left"
                    >
                      <span className="text-[9px] font-black text-gray-200 group-hover:text-blue-600 transition-colors mr-6">0{idx + 1}</span>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:tracking-[0.1em] transition-all duration-700 uppercase tracking-tighter">{cat}</h3>
                    </button>
                  ))}
                </div>
              </div>
              <div className="animate-in fade-in slide-in-from-right-10 duration-1000 text-left lg:text-right flex flex-col lg:items-end order-1 lg:order-2">
                <span className="text-blue-600 font-black text-[9px] uppercase tracking-[0.5em] mb-4 block">Fábrica Directa 2024</span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-4">Tu Socio en Gorras<br/>Personalizadas.</h2>
                <h3 className="text-lg md:text-xl font-medium text-gray-400 tracking-tight mb-8">Del taller a tu negocio. <span className="text-black font-black">Sin intermediarios.</span></h3>
                <button onClick={() => setViewMode('catalog')} className="mt-8 h-12 px-10 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-blue-600 transition-all shadow-xl">Ver Muestras</button>
              </div>
            </div>
            <div className="relative w-full overflow-hidden bg-gray-50 py-10 border-y border-gray-100">
              <div className="animate-marquee whitespace-nowrap">
                {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, i) => (
                  <div key={i} className="inline-block mx-4 group">
                    <div className="w-64 aspect-[4/3] overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {viewMode === 'catalog' && (
          <div className="animate-in fade-in duration-500">
            <FilterBar 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />
            <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pb-32 pt-12">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Mostrando <span className="text-gray-900">{filteredCaps.length}</span> modelos encontrados
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filteredCaps.length > 0 ? (
                  filteredCaps.map(cap => (
                    <CapCard 
                      key={cap.id} 
                      cap={cap} 
                      onClick={setSelectedCap} 
                      onAddToQuote={() => addToQuote(cap)} 
                      isQuoted={!!quoteList.find(q => q.id === cap.id)} 
                    />
                  ))
                ) : (
                  <div className="col-span-full py-32 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 11V13M10 13V15M10 13H12M10 13H8" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Sin coincidencias</h3>
                    <p className="text-gray-400 font-medium text-sm mb-8">No pudimos encontrar gorras para "{searchQuery}".</p>
                    <button 
                      onClick={() => {setSearchQuery(''); setActiveCategory('Todas');}} 
                      className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'portfolio' && (
          <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 pb-32 animate-in fade-in duration-700 text-left">
             <nav className="flex items-center text-[9px] font-black uppercase tracking-widest text-gray-300 mb-10">
              <span className="cursor-pointer hover:text-black" onClick={() => setViewMode('home')}>Inicio</span>
              <span className="mx-3 text-gray-200">/</span>
              <span className="text-black">Portafolio de Clientes</span>
            </nav>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CLIENT_PROJECTS.map((project) => (
                <div key={project.id} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all p-6 text-left">
                  <div className="aspect-square overflow-hidden rounded-xl mb-6">
                    <img src={project.imagen} alt={project.cliente} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-gray-900">{project.cliente}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{project.detalles}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'technology' && (
          <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 pb-32 animate-in fade-in duration-700 text-left">
            <nav className="flex items-center text-[9px] font-black uppercase tracking-widest text-gray-300 mb-10">
              <span className="cursor-pointer hover:text-black" onClick={() => setViewMode('home')}>Inicio</span>
              <span className="mx-3 text-gray-200">/</span>
              <span className="text-black">Infraestructura & Tecnología</span>
            </nav>

            <div className="mb-20">
              <span className="text-blue-600 font-black text-[9px] uppercase tracking-[0.5em] mb-4 block">Capacidad Industrial</span>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-[0.8]">
                Ingeniería<br/><span className="text-blue-600">Textil.</span>
              </h2>
              <p className="mt-8 text-gray-400 max-w-xl text-sm font-medium leading-relaxed">
                Nuestra planta está equipada con tecnología de punta para garantizar que cada puntada cumpla con los estándares internacionales de retail premium.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {TECH_INNOVATIONS.map((tech) => (
                <div key={tech.id} className="group relative h-[500px] overflow-hidden rounded-[2.5rem] bg-black cursor-pointer shadow-2xl">
                  {/* Background Image */}
                  <img
                    src={tech.imagen}
                    alt={tech.titulo}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-[1.2s] ease-out group-hover:scale-110 group-hover:opacity-30"
                  />

                  {/* Static Content (Always visible) */}
                  <div className="absolute inset-0 p-12 flex flex-col justify-end transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <span className="text-blue-400 font-black text-[8px] uppercase tracking-[0.5em] mb-4">
                      PROCESO ID: {tech.id}
                    </span>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      {tech.titulo}
                    </h3>
                  </div>

                  {/* Reveal Content (Hover Overlay) */}
                  <div className="absolute inset-0 bg-blue-600/95 backdrop-blur-md p-12 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0">
                    <div className="mb-10">
                      <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4">Ingeniería Aplicada</h4>
                      <p className="text-white text-base font-medium leading-relaxed">
                        {tech.descripcion}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/20">
                      <div>
                        <h4 className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Especificación</h4>
                        <p className="text-white text-[12px] font-black uppercase tracking-tight">{tech.especificacion}</p>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Valor de Marca</h4>
                        <p className="text-white text-[12px] font-black uppercase tracking-tight">{tech.beneficio}</p>
                      </div>
                    </div>

                    <div className="mt-12">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewMode('catalog'); }}
                        className="px-8 py-4 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all shadow-xl"
                      >
                        Aplicar a mi Proyecto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-32 p-16 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between text-left">
              <div className="max-w-xl mb-10 md:mb-0">
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">¿Buscas una técnica específica?</h3>
                <p className="text-gray-500 text-sm font-medium">Nuestro departamento de I+D desarrolla nuevas técnicas de bordado y acabados cada trimestre. Si tienes un diseño complejo, nosotros tenemos la solución técnica.</p>
              </div>
              <button 
                onClick={() => window.open('https://wa.me/51999999999?text=Hola%2C%20quisiera%20consultar%20sobre%20una%20t%C3%A9cnica%20de%20fabricaci%C3%B3n%20especial.', '_blank')}
                className="px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all shadow-2xl"
              >
                Consultar con un Técnico
              </button>
            </div>
          </div>
        )}

        {viewMode === 'b2b' && (
          <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 pb-32 animate-in fade-in duration-700 text-left">
             <nav className="flex items-center text-[9px] font-black uppercase tracking-widest text-gray-300 mb-10">
              <span className="cursor-pointer hover:text-black" onClick={() => setViewMode('home')}>Inicio</span>
              <span className="mx-3 text-gray-200">/</span>
              <span className="text-black">Canal B2B & Corporativo</span>
            </nav>

            <div className="mb-20 grid lg:grid-cols-2 gap-16 items-start text-left">
              <div className="sticky top-32">
                <span className="text-blue-600 font-black text-[9px] uppercase tracking-[0.5em] mb-4 block">Alianzas por Volumen</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-6 leading-[0.9]">Potencia tu Marca con<br/>Fabricación Directa.</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 max-w-lg">
                  Nuestra división B2B ofrece soluciones integrales para marcas de retail, startups en crecimiento y corporaciones internacionales que buscan merchandising de alta gama. 
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => window.open('https://wa.me/51999999999?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20ventas%20corporativas%20B2B', '_blank')} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all shadow-xl">Contactar Ejecutivo</button>
                  <button onClick={() => setViewMode('catalog')} className="px-10 py-4 border border-black text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all">Ver Modelos Base</button>
                </div>
              </div>

              {/* Interactive Benefits List */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6">Beneficios Corporativos Exclusivos</h3>
                {B2B_BENEFITS.map((benefit) => {
                  const isExpanded = expandedBenefit === benefit.id;
                  return (
                    <div 
                      key={benefit.id} 
                      className={`group border rounded-[2rem] transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-blue-600 border-blue-600 shadow-2xl' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                    >
                      <button 
                        onClick={() => setExpandedBenefit(isExpanded ? null : benefit.id)}
                        className="w-full p-8 flex items-center text-left focus:outline-none"
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 ${isExpanded ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                          </svg>
                        </div>
                        <div className="ml-6 flex-grow">
                          <h4 className={`text-lg font-black uppercase tracking-tighter transition-colors duration-500 ${isExpanded ? 'text-white' : 'text-gray-900'}`}>
                            {benefit.title}
                          </h4>
                          {!isExpanded && (
                            <p className="text-[10px] font-medium text-gray-400 mt-1 line-clamp-1">{benefit.short}</p>
                          )}
                        </div>
                        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180 text-white' : 'text-gray-300'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-8 pb-8 pl-[88px]">
                          <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                            {benefit.details}
                          </p>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Soporte 24/7</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Garantía Total</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-[3rem] p-12 md:p-20">
               <div className="text-center mb-16">
                 <span className="text-blue-600 font-black text-[9px] uppercase tracking-[0.5em] mb-4 block">Flujo de Trabajo B2B</span>
                 <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Tu Proyecto en 4 Etapas</h3>
               </div>
               
               <div className="grid md:grid-cols-4 gap-8">
                  {[
                    { step: '01', title: 'Briefing', desc: 'Definimos diseño, materiales y volúmenes requeridos.' },
                    { step: '02', title: 'Muestreo', desc: 'Creamos una muestra física para tu aprobación final.' },
                    { step: '03', title: 'Producción', desc: 'Fabricación masiva con control de calidad estricto.' },
                    { step: '04', title: 'Entrega', desc: 'Despacho logístico a tus centros de distribución.' }
                  ].map((item, i) => (
                    <div key={i} className="relative group">
                      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl text-left">
                        <span className="text-[32px] font-black text-blue-600/10 mb-4 block leading-none">{item.step}</span>
                        <h4 className="text-[12px] font-black uppercase tracking-widest mb-3 text-gray-900">{item.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                      {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[1px] bg-gray-200"></div>}
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-32 border-t border-gray-100 pt-32 text-center">
               <h3 className="text-5xl font-black tracking-tighter uppercase mb-10 text-gray-900">¿Hablamos de negocios?</h3>
               <div className="bg-blue-600 text-white p-12 rounded-[3rem] max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-left">
                  <div className="mb-8 md:mb-0">
                    <p className="text-2xl font-black mb-2 uppercase tracking-tighter">Área de Cuentas Clave</p>
                    <p className="text-[11px] font-medium opacity-80 uppercase tracking-widest">Respuesta garantizada en menos de 2 horas</p>
                  </div>
                  <button className="px-12 py-5 bg-white text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-2xl">Agendar una Reunión</button>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg cursor-pointer hover:rotate-6 transition-transform" onClick={() => setViewMode('home')}>
            <span className="text-white font-black text-xl">CF</span>
          </div>
          <p className="text-sm font-black text-gray-900 uppercase tracking-[0.4em] mb-2">CAP FACTORY PERÚ</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em]">Manufactura Textil Profesional</p>
        </div>
      </footer>

      <Lightbox cap={selectedCap} onClose={() => setSelectedCap(null)} onAddToQuote={() => selectedCap && addToQuote(selectedCap)} isQuoted={!!selectedCap && !!quoteList.find(q => q.id === selectedCap.id)} />
      <QuoteDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} items={quoteList} onRemove={removeFromQuote} />
    </div>
  );
};

export default App;
