import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import CapCard from './components/CapCard';
import Lightbox from './components/Lightbox';
import QuoteDrawer from './components/QuoteDrawer';
import AdminPanel from './components/AdminPanel';
import PriceCalculator from './components/PriceCalculator';
import CapConfigurator from './components/CapConfigurator';
import CapSimulator from './components/CapSimulator';
import Portfolio from './components/Portfolio';
import { CAPS_DATA, CLIENT_PROJECTS, TECH_INNOVATIONS, GLOBAL_CONFIG } from './constants';
import { CapProduct, Category, QuoteItem, ViewMode } from './types';
import { api, DBProduct, DBProject } from './lib/api';

const toCapProduct = (p: DBProduct): CapProduct => ({
  id: p.id,
  nombre: p.nombre,
  categoria: p.categoria,
  imagen: p.imagen,
  imagenes: p.imagenes || [],
  descripcion: p.descripcion,
  moq: p.moq,
  entrega: p.entrega,
  precio: p.precio,
  precio_antes: p.precio_antes,
  tags: p.tags,
  fichaTecnica: { tela: p.tela, bordado: p.bordado, visera: p.visera, broche: p.broche, acabados: p.acabados },
});

const MARQUEE_IMAGES: string[] = [];

const B2B_BENEFITS = [
  {
    id: 'b1',
    title: 'Te entregamos a tiempo, siempre',
    short: 'Sabemos que tienes fechas. Planificamos la producción para que llegues puntual.',
    details: 'Trabajamos con cronogramas claros desde el primer día. Si tienes un evento, lanzamiento o fecha límite, nos adaptamos a tu calendario. Los pedidos grandes tienen línea de producción propia para no mezclarse con otros trabajos.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'b2',
    title: 'Tu logo en todo, hasta en la etiqueta',
    short: 'Ponemos tu marca en cada detalle: bordado, etiqueta interna, empaque.',
    details: 'No es solo bordar el logo en la copa. Podemos hacerlo en la visera, poner tu etiqueta de tela por dentro, personalizar el broche trasero y hasta empacar cada gorra en bolsa individual con tu diseño. Todo para que se vea como una marca seria.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'b3',
    title: 'Más pides, menos pagas por unidad',
    short: 'El precio baja según la cantidad. Desde 50 hasta miles de unidades.',
    details: 'El precio por gorra cambia según cuántas pides. Con 50 unidades ya arrancas. Con 300 el precio baja notablemente. Con 1,000 o más, el ahorro es muy significativo. Puedes usar nuestra calculadora para ver exactamente cuánto sale tu pedido.',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    id: 'b4',
    title: 'Enviamos a cualquier parte del mundo',
    short: 'Lima, provincias o al extranjero. Nos encargamos del envío.',
    details: 'Despachamos a cualquier ciudad del Perú y también al extranjero. Si eres de otro país y quieres hacer un pedido, coordinamos el envío internacional con guía de seguimiento. Tú solo recibes las gorras en tu puerta.',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
];

const App: React.FC = () => {
  const isAdmin = window.location.pathname === '/admin';

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  // configurador view handled separately
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCap, setSelectedCap] = useState<CapProduct | null>(null);
  const [quoteList, setQuoteList] = useState<QuoteItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>('b1');
  const [dbProducts, setDbProducts] = useState<CapProduct[] | null>(null);
  const [dbProjects, setDbProjects] = useState<DBProject[] | null>(null);
  const [marqueeImages, setMarqueeImages] = useState<string[]>(MARQUEE_IMAGES);

  useEffect(() => {
    api.list('products').then((data: DBProduct[]) => {
      if (data && data.length > 0) {
        const products = data.map(toCapProduct);
        setDbProducts(products);
        const imgs = products.map(p => p.imagen).filter(Boolean);
        if (imgs.length > 0) setMarqueeImages(imgs);
      }
    });
    api.list('projects').then((data: DBProject[]) => {
      if (data) setDbProjects(data);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('cf_quote_list');
    if (saved) {
      try { setQuoteList(JSON.parse(saved)); } catch {}
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
    setQuoteList([...quoteList, { ...cap, timestamp: Date.now(), quantity: cap.moq || 50, color: '' }]);
    setIsDrawerOpen(true);
  };

  const updateQuoteItem = (id: string, updates: Partial<QuoteItem>) => {
    setQuoteList(quoteList.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeFromQuote = (id: string) => {
    setQuoteList(quoteList.filter(item => item.id !== id));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (viewMode !== 'catalog') setViewMode('catalog');
  };

  const allProducts = dbProducts ?? CAPS_DATA;
  const catalogCategories = [...new Set(allProducts.map(p => p.categoria))];

  const filteredCaps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allProducts.filter(cap => {
      const matchesCat = activeCategory === 'Todas' || cap.categoria === activeCategory;
      if (!q) return matchesCat;
      return matchesCat && (
        cap.nombre.toLowerCase().includes(q) ||
        cap.descripcion.toLowerCase().includes(q) ||
        cap.categoria.toLowerCase().includes(q) ||
        cap.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery, allProducts]);

  if (isAdmin) {
    return <AdminPanel onExit={() => window.location.href = '/'} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-dark">

      <Header
        onOpenQuote={() => setIsDrawerOpen(true)}
        quoteCount={quoteList.length}
        activeView={viewMode}
        onSetView={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
      />

      <main className="flex-grow">

        {/* ── HOME ─────────────────────────────────────────── */}
        {viewMode === 'home' && (
          <>
            {/* Hero */}
            <section className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-16 pb-10 grid lg:grid-cols-2 gap-12 items-end">

              {/* Left — categories index */}
              <div className="order-2 lg:order-1">
                <p className="text-[9px] font-medium text-grey tracking-[0.5em] uppercase mb-6">Archivo de producción</p>
                <div>
                  {catalogCategories.map((cat, idx) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setViewMode('catalog'); }}
                      className="group w-full flex items-baseline gap-5 py-4 border-b border-grey-border hover:border-dark transition-all text-left"
                    >
                      <span className="text-[9px] font-medium text-grey group-hover:text-primary transition-colors w-5 flex-shrink-0">0{idx + 1}</span>
                      <span className="font-display text-2xl md:text-3xl font-bold text-dark group-hover:tracking-wide transition-all duration-500 uppercase">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right — headline */}
              <div className="order-1 lg:order-2 lg:text-right flex flex-col lg:items-end">
                <span className="text-[9px] font-medium text-primary tracking-[0.5em] uppercase mb-4 block">Fábrica directa — Perú</span>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-dark leading-[0.9] tracking-tight mb-5">
                  Tu socio en<br />gorras<br />
                  <span className="text-primary">personalizadas.</span>
                </h1>
                <p className="text-grey text-base md:text-lg font-light mb-8 max-w-sm">
                  Del taller a tu negocio. <strong className="font-semibold text-dark">Sin intermediarios.</strong>
                </p>
                <button
                  onClick={() => setViewMode('catalog')}
                  className="inline-flex items-center gap-3 bg-dark text-cream text-[11px] font-medium tracking-widest uppercase px-8 py-3.5 rounded-full hover:bg-primary transition-colors shadow-sm"
                >
                  Ver catálogo
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </section>

            {/* Marquee strip */}
            <div className="border-y border-grey-border overflow-hidden py-8 my-8 bg-white">
              <div className="animate-marquee">
                {[...marqueeImages, ...marqueeImages].map((img, i) => (
                  <div key={i} className="inline-block mx-3 group">
                    <div className="w-56 aspect-[4/3] overflow-hidden rounded-xl bg-grey-light">
                      <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats strip */}
            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 py-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '+15 años', label: 'de manufactura' },
                  { value: '50 uds', label: 'pedido mínimo' },
                  { value: '100%', label: 'personalizable' },
                  { value: 'Global', label: 'envíos mundiales' },
                ].map(stat => (
                  <div key={stat.label} className="border border-grey-border rounded-xl p-5 bg-white">
                    <p className="font-display text-2xl font-bold text-dark">{stat.value}</p>
                    <p className="text-[10px] text-grey font-medium uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── CATALOG ──────────────────────────────────────── */}
        {viewMode === 'catalog' && (
          <div>
            <FilterBar
              categories={catalogCategories}
              activeCategory={activeCategory}
              onCategoryChange={(cat) => setActiveCategory(cat)}
              searchQuery={searchQuery}
            />
            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-8 pb-24">
              <p className="text-[10px] text-grey font-medium uppercase tracking-widest mb-6">
                {filteredCaps.length} modelos
              </p>
              {filteredCaps.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredCaps.map(cap => (
                    <CapCard
                      key={cap.id}
                      cap={cap}
                      onClick={setSelectedCap}
                      onAddToQuote={() => addToQuote(cap)}
                      isQuoted={!!quoteList.find(q => q.id === cap.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center">
                  <p className="font-display text-xl font-bold text-dark mb-2">Sin resultados</p>
                  <p className="text-grey text-sm mb-8">No encontramos gorras para "{searchQuery}".</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('Todas'); }}
                    className="px-6 py-3 bg-dark text-cream text-[10px] font-medium tracking-widest uppercase rounded-full hover:bg-primary transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONFIGURADOR 3D ──────────────────────────────── */}
        {viewMode === 'configurador' && (
          <CapSimulator onBack={() => setViewMode('home')} />
        )}

        {/* ── PORTFOLIO ────────────────────────────────────── */}
        {viewMode === 'portfolio' && (
          <Portfolio
            projects={dbProjects && dbProjects.length > 0 ? dbProjects : CLIENT_PROJECTS}
            onHome={() => setViewMode('home')}
          />
        )}

        {/* ── TECHNOLOGY ───────────────────────────────────── */}
        {viewMode === 'technology' && (
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-8 pb-24">
            <Breadcrumb label="Fábrica" onHome={() => setViewMode('home')} />

            {/* Calculadora de precios */}
            <div className="mb-20">
              <PriceCalculator onGoToCatalog={() => setViewMode('catalog')} />
            </div>

            <div className="mb-14">
              <SectionTitle>Ingeniería <span className="text-primary">textil.</span></SectionTitle>
              <p className="text-grey text-sm max-w-xl mt-4 leading-relaxed">
                Planta equipada con tecnología de punta para garantizar que cada puntada cumpla los estándares internacionales de retail premium.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TECH_INNOVATIONS.map(tech => (
                <div key={tech.id} className="group relative h-[460px] overflow-hidden rounded-2xl bg-dark cursor-pointer">
                  <img
                    src={tech.imagen}
                    alt={tech.titulo}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 transition-all duration-[1.2s] group-hover:scale-110 group-hover:opacity-20"
                  />
                  {/* Static */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-end transition-all duration-400 group-hover:opacity-0">
                    <p className="text-[9px] text-primary font-medium tracking-[0.4em] uppercase mb-3">PROCESO {tech.id}</p>
                    <h3 className="font-display text-3xl font-bold text-cream uppercase leading-tight">{tech.titulo}</h3>
                  </div>
                  {/* Hover */}
                  <div className="absolute inset-0 bg-dark/95 p-10 flex flex-col justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400">
                    <p className="text-[9px] text-primary font-medium tracking-[0.3em] uppercase mb-4">Ingeniería aplicada</p>
                    <p className="text-cream/80 text-sm leading-relaxed mb-8">{tech.descripcion}</p>
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                      <div>
                        <p className="text-[8px] text-cream/40 uppercase tracking-widest mb-1">Especificación</p>
                        <p className="text-cream text-[12px] font-semibold uppercase">{tech.especificacion}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-cream/40 uppercase tracking-widest mb-1">Valor de marca</p>
                        <p className="text-cream text-[12px] font-semibold uppercase">{tech.beneficio}</p>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setViewMode('catalog'); }}
                      className="mt-8 self-start px-6 py-3 bg-primary text-cream text-[10px] font-medium tracking-widest uppercase rounded-full hover:bg-white hover:text-dark transition-colors"
                    >
                      Aplicar a mi proyecto
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 bg-white border border-grey-border rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="font-display text-2xl font-bold text-dark mb-2">¿Buscas una técnica específica?</h3>
                <p className="text-grey text-sm max-w-md leading-relaxed">Nuestro equipo de I+D desarrolla nuevas técnicas cada trimestre. Cuéntanos tu proyecto.</p>
              </div>
              <button
                onClick={() => window.open(`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20consultar%20sobre%20una%20t%C3%A9cnica%20especial.`, '_blank')}
                className="flex-shrink-0 px-8 py-3.5 bg-dark text-cream text-[11px] font-medium tracking-widest uppercase rounded-full hover:bg-primary transition-colors"
              >
                Consultar con un técnico
              </button>
            </div>
          </div>
        )}

        {/* ── B2B ──────────────────────────────────────────── */}
        {viewMode === 'b2b' && (
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-8 pb-24">
            <Breadcrumb label="Pedidos grandes" onHome={() => setViewMode('home')} />

            <div className="grid lg:grid-cols-2 gap-16 items-start mt-10 mb-20">
              {/* Sticky left */}
              <div className="lg:sticky lg:top-28">
                <span className="text-[9px] font-medium text-primary tracking-[0.5em] uppercase block mb-4">Para empresas y negocios</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-dark leading-[0.9] uppercase mb-5">
                  ¿Necesitas gorras<br />para tu negocio<br />o evento?
                </h2>
                <p className="text-grey text-sm leading-relaxed mb-8 max-w-md">
                  Trabajamos directo contigo, sin intermediarios. Desde 50 unidades con tu logo, colores y diseño. Te asesoramos en todo el proceso.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.open(`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=Hola%2C%20quiero%20hacer%20un%20pedido%20de%20gorras%20personalizadas%20para%20mi%20negocio`, '_blank')}
                    className="px-8 py-3.5 bg-dark text-cream text-[10px] font-medium tracking-widest uppercase rounded-full hover:bg-primary transition-colors"
                  >
                    Escribir por WhatsApp
                  </button>
                  <button
                    onClick={() => setViewMode('catalog')}
                    className="px-8 py-3.5 border border-dark text-dark text-[10px] font-medium tracking-widest uppercase rounded-full hover:bg-dark hover:text-cream transition-colors"
                  >
                    Ver el catálogo
                  </button>
                </div>
              </div>

              {/* Benefits accordion */}
              <div className="space-y-3">
                <p className="text-[9px] text-grey font-medium uppercase tracking-widest mb-5">¿Por qué trabajar con nosotros?</p>
                {B2B_BENEFITS.map(benefit => {
                  const isOpen = expandedBenefit === benefit.id;
                  return (
                    <div
                      key={benefit.id}
                      className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-dark bg-dark' : 'border-grey-border bg-white hover:border-dark/30'}`}
                    >
                      <button
                        onClick={() => setExpandedBenefit(isOpen ? null : benefit.id)}
                        className="w-full p-5 flex items-center gap-4 text-left"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-white/10 text-primary' : 'bg-grey-light text-primary'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={benefit.icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-display text-[15px] font-bold leading-tight ${isOpen ? 'text-cream' : 'text-dark'}`}>
                            {benefit.title}
                          </h4>
                          {!isOpen && <p className="text-[10px] text-grey mt-0.5 line-clamp-1">{benefit.short}</p>}
                        </div>
                        <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-cream/50' : 'text-grey'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pl-[68px]">
                          <p className="text-cream/70 text-sm leading-relaxed">{benefit.details}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process steps */}
            <div className="bg-white border border-grey-border rounded-2xl p-10 md:p-14">
              <p className="text-[9px] text-primary font-medium tracking-[0.5em] uppercase text-center mb-2">Así funciona</p>
              <h3 className="font-display text-2xl font-bold text-dark text-center mb-10">Tu pedido en 4 pasos simples</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: '01', title: 'Nos escribes', desc: 'Cuéntanos cuántas gorras necesitas y qué diseño tienes en mente.' },
                  { step: '02', title: 'Te enviamos una muestra', desc: 'Hacemos una muestra física para que la apruebes antes de producir.' },
                  { step: '03', title: 'Producimos tu pedido', desc: 'Fabricamos todas las gorras con control de calidad en cada una.' },
                  { step: '04', title: 'Las recibes en tu puerta', desc: 'Enviamos a tu dirección en Lima, provincias o el extranjero.' }
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="p-6 rounded-xl border border-grey-border bg-cream hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                      <span className="font-display text-4xl font-bold text-primary/20 block mb-3">{item.step}</span>
                      <h4 className="font-display text-[13px] font-bold uppercase tracking-wider text-dark mb-2">{item.title}</h4>
                      <p className="text-[11px] text-grey leading-relaxed">{item.desc}</p>
                    </div>
                    {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-grey-border" />}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-20 bg-dark rounded-2xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="font-display text-3xl font-bold text-cream mb-2">¿Listo para cotizar?</h3>
                <p className="text-cream/50 text-sm">Te respondemos en menos de 2 horas. Sin compromisos.</p>
              </div>
              <button
                onClick={() => window.open(`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20cotizar%20gorras%20personalizadas`, '_blank')}
                className="flex-shrink-0 px-10 py-4 bg-primary text-cream text-[11px] font-medium tracking-widest uppercase rounded-full hover:bg-white hover:text-dark transition-colors shadow-lg"
              >
                Cotizar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-grey-border py-14 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={() => setViewMode('home')} className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-dark rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
              <span className="text-cream font-display font-bold text-sm">CF</span>
            </div>
            <div className="text-left">
              <p className="font-display text-[13px] font-bold text-dark uppercase tracking-widest">Cap Factory</p>
              <p className="text-[9px] text-grey font-medium uppercase tracking-widest">Manufactura textil — Perú</p>
            </div>
          </button>
          <p className="text-[10px] text-grey font-medium">© 2025 Cap Factory Perú. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
      >
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/>
        </svg>
      </a>

      <Lightbox
        cap={selectedCap}
        onClose={() => setSelectedCap(null)}
        onAddToQuote={() => selectedCap && addToQuote(selectedCap)}
        isQuoted={!!selectedCap && !!quoteList.find(q => q.id === selectedCap.id)}
      />
      <QuoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={quoteList}
        onRemove={removeFromQuote}
        onUpdate={updateQuoteItem}
      />
    </div>
  );
};

// ── Shared micro-components ──────────────────────────────
const Breadcrumb: React.FC<{ label: string; onHome: () => void }> = ({ label, onHome }) => (
  <nav className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-grey mb-8">
    <button onClick={onHome} className="hover:text-dark transition-colors">Inicio</button>
    <span>/</span>
    <span className="text-dark">{label}</span>
  </nav>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-display text-4xl md:text-6xl font-bold text-dark leading-[0.9] uppercase tracking-tight">
    {children}
  </h2>
);

export default App;
