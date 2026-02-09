
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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 h-20">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 h-full flex items-center justify-between gap-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 group cursor-pointer flex-shrink-0" onClick={() => onSetView('home')}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-lg">
            <span className="text-white font-black text-xl tracking-tighter">CF</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-[12px] font-black text-gray-900 tracking-[0.2em] leading-none uppercase">Cap Factory</h1>
            <span className="text-[7.5px] text-blue-600 font-black tracking-[0.4em] uppercase mt-1">Premium Arch.</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="hidden xl:flex items-center space-x-10">
          {[
            { id: 'catalog', label: 'Muestras' },
            { id: 'portfolio', label: 'Portafolio' },
            { id: 'technology', label: 'Tecnología' },
            { id: 'b2b', label: 'B2B' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => onSetView(item.id as ViewMode)} 
              className={`text-[9.5px] font-black transition-all uppercase tracking-[0.3em] relative py-2 ${activeView === item.id ? 'text-black' : 'text-gray-300 hover:text-black'}`}
            >
              {item.label}
              {activeView === item.id && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 animate-in fade-in slide-in-from-left-2 duration-500"></span>}
            </button>
          ))}
        </nav>

        {/* Único Buscador Global */}
        <div className="flex items-center flex-grow justify-end space-x-6 max-w-xl">
          <div className="relative flex-grow max-w-sm hidden md:block">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <input 
              type="text" 
              placeholder="BUSCAR GORRA O TÉCNICA..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white text-[9px] font-black uppercase tracking-[0.15em] pl-10 pr-10 py-3.5 rounded-xl transition-all outline-none placeholder:text-gray-300 shadow-inner focus:shadow-xl focus:shadow-blue-600/5"
            />

            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-red-500 transition-colors"
                title="Limpiar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-6 flex-shrink-0">
            <button 
              onClick={onOpenQuote}
              className="relative flex items-center space-x-2 group p-2"
            >
              <svg className="w-5 h-5 text-gray-900 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {quoteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[7.5px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-in zoom-in duration-300">
                  {quoteCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => onSetView('catalog')}
              className="hidden lg:flex h-11 px-8 bg-black hover:bg-blue-600 text-white text-[9px] font-black rounded-xl items-center justify-center transition-all tracking-[0.2em] uppercase shadow-lg hover:shadow-blue-600/20 active:scale-95"
            >
              VER CATÁLOGO
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
