
import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  onOpenQuote: () => void;
  quoteCount: number;
  activeView: ViewMode;
  onSetView: (view: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onOpenQuote, 
  quoteCount, 
  activeView, 
  onSetView,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="bg-white sticky top-0 z-40">
      {/* Top Tier: Logo, Search, Cart */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 h-20 md:h-24 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer flex-shrink-0" onClick={() => onSetView('home')}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl md:text-2xl tracking-tighter">CF</span>
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-[14px] font-black text-dark tracking-[0.1em] leading-none uppercase">Cap Factory</h1>
              <span className="text-[8px] text-primary font-black tracking-[0.3em] uppercase mt-1">Industrial Premium</span>
            </div>
          </div>
          
          {/* Search Bar - Center */}
          <div className="flex-grow max-w-2xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="¿Qué modelo de gorra buscas today?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-grey-light border-0 focus:ring-2 focus:ring-primary/20 text-[11px] md:text-xs font-medium pl-11 pr-10 py-3.5 md:py-4 rounded-full transition-all outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <div className="flex items-center space-x-4 md:space-x-6 flex-shrink-0">
            <button 
              onClick={onOpenQuote}
              className="relative p-2 text-dark hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {quoteCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {quoteCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tier: Categories Navigation */}
      <div className="border-b border-gray-100 hidden md:block">
        <div className="max-w-[1600px] mx-auto px-12 h-14 flex items-center justify-center space-x-12">
          {[
            { id: 'catalog', label: 'Catálogo de Muestras' },
            { id: 'portfolio', label: 'Proyectos' },
            { id: 'technology', label: 'Fábrica' },
            { id: 'b2b', label: 'B2B / Corporativo' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => onSetView(item.id as ViewMode)} 
              className={`text-[10px] font-bold transition-all uppercase tracking-widest relative py-4 ${activeView === item.id ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
            >
              {item.label}
              {activeView === item.id && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary"></span>}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
export default Header;
