
import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface FilterBarProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeCategory, 
  setActiveCategory, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl py-6 border-b border-gray-100 sticky top-20 z-30 transition-all duration-500 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          
          {/* Navegación de Categorías - Ahora centrada y más limpia */}
          <nav className="flex items-center space-x-10 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category)}
                className={`group relative whitespace-nowrap text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 pb-2 ${
                  activeCategory === cat
                    ? 'text-black'
                    : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {cat}
                <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 transition-transform duration-500 ease-out origin-left ${
                  activeCategory === cat ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                }`}></span>
              </button>
            ))}
          </nav>

          {/* Indicador de Filtro Activo (en lugar de un segundo buscador) */}
          {searchQuery && (
            <div className="mt-4 md:mt-0 flex items-center space-x-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Filtrando por:</span>
              <div className="flex items-center bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter mr-2">"{searchQuery}"</span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-blue-400 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
