import React, { useState } from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  onOpenQuote: () => void;
  quoteCount: number;
  activeView: ViewMode;
  onSetView: (view: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const NAV_ITEMS = [
  { id: 'catalog', label: 'Catálogo de Gorras' },
  { id: 'portfolio', label: 'Proyectos' },
  { id: 'technology', label: 'Nuestra Fábrica' },
  { id: 'b2b', label: 'Ventas Corporativas' },
] as const;

const Header: React.FC<HeaderProps> = ({
  onOpenQuote,
  quoteCount,
  activeView,
  onSetView,
  searchQuery,
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-cream sticky top-0 z-40 shadow-sm border-b border-grey-border">
      {/* Nivel Superior: Logo, Búsqueda, Carrito */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 h-16 md:h-20 flex items-center justify-between gap-6">
        
        {/* Logo */}
        <button
          onClick={() => onSetView('home')}
          className="flex items-center gap-3 flex-shrink-0 group"
        >
          <div className="w-10 h-10 bg-primary text-cream rounded-xl flex items-center justify-center group-hover:bg-dark transition-colors duration-300 shadow-sm">
            <span className="font-display font-black text-xl tracking-tighter">CF</span>
          </div>
          <div className="hidden sm:block text-left">
            <span className="block font-display text-[15px] font-black text-dark tracking-wide uppercase leading-tight group-hover:text-primary transition-colors">Cap Factory</span>
            <span className="block text-[10px] text-grey font-medium tracking-[0.2em] uppercase leading-tight">Perú</span>
          </div>
        </button>

        {/* Búsqueda (Desktop) */}
        <div className="relative hidden md:block flex-1 max-w-xl mx-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por modelo, tipo o SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-grey-light border border-grey-border text-xs font-medium pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-grey"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-grey hover:text-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Carrito & Menú Móvil */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenQuote}
            className="relative h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-dark text-cream hover:bg-primary transition-colors font-medium text-xs tracking-widest shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline">COTIZAR</span>
            {quoteCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-cream text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-cream">
                {quoteCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-grey-light hover:bg-grey-border transition-colors text-dark"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Nivel Inferior: Navegación (Desktop) */}
      <div className="hidden md:block bg-white border-t border-grey-border">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 h-12 flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as ViewMode)}
              className={`text-[10px] font-bold tracking-widest uppercase transition-all h-full relative ${
                activeView === item.id ? 'text-primary' : 'text-grey hover:text-dark'
              }`}
            >
              {item.label}
              {activeView === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-grey-border px-6 py-4 flex flex-col gap-4 shadow-lg absolute w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-grey-light border border-grey-border text-xs font-medium pl-9 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <nav className="flex flex-col border-t border-grey-border pt-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { onSetView(item.id as ViewMode); setMobileMenuOpen(false); }}
                className={`text-left py-3.5 text-xs font-bold tracking-widest uppercase border-b border-grey-border last:border-0 transition-colors ${
                  activeView === item.id ? 'text-primary' : 'text-grey hover:text-dark'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
