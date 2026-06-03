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
  { id: 'catalog', label: 'Catálogo' },
  { id: 'portfolio', label: 'Proyectos' },
  { id: 'technology', label: 'Fábrica' },
  { id: 'b2b', label: 'B2B' }
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
    <header className="bg-cream sticky top-0 z-40 border-b border-grey-border">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 h-18 md:h-20 flex items-center justify-between gap-6">

        {/* Logo */}
        <button
          onClick={() => onSetView('home')}
          className="flex items-center gap-3 flex-shrink-0 group"
        >
          <div className="w-9 h-9 bg-dark rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
            <span className="text-cream font-display font-bold text-sm tracking-tight">CF</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-[13px] font-bold text-dark tracking-widest uppercase">Cap Factory</span>
            <span className="block text-[9px] text-primary font-medium tracking-[0.3em] uppercase">Perú</span>
          </div>
        </button>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as ViewMode)}
              className={`text-[11px] font-medium tracking-widest uppercase transition-colors relative pb-0.5 ${
                activeView === item.id
                  ? 'text-dark'
                  : 'text-grey hover:text-dark'
              }`}
            >
              {item.label}
              {activeView === item.id && (
                <span className="absolute -bottom-0.5 left-0 w-full h-px bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Right: search + cart */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-grey-light border border-grey-border text-[11px] font-medium pl-9 pr-8 py-2.5 rounded-full w-52 focus:outline-none focus:border-primary transition-colors placeholder:text-grey"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-dark transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={onOpenQuote}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey-light transition-colors text-dark"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {quoteCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-cream text-[8px] font-bold rounded-full flex items-center justify-center">
                {quoteCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey-light transition-colors text-dark"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-t border-grey-border px-6 py-4 flex flex-col gap-1">
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-grey-light border border-grey-border text-[11px] font-medium pl-9 pr-4 py-2.5 rounded-full w-full focus:outline-none focus:border-primary transition-colors placeholder:text-grey"
            />
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { onSetView(item.id as ViewMode); setMobileMenuOpen(false); }}
              className={`text-left py-3 text-[12px] font-medium tracking-widest uppercase border-b border-grey-border last:border-0 transition-colors ${
                activeView === item.id ? 'text-primary' : 'text-grey hover:text-dark'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
