import React from 'react';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  searchQuery
}) => {
  return (
    <div className="bg-white border-b border-gray-100 py-4 sticky top-[136px] md:top-[152px] z-30 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 flex items-center justify-between gap-8">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => onCategoryChange('Todas')}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === 'Todas' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="hidden sm:flex items-center space-x-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter italic">Buscando:</span>
            <span className="text-[10px] font-black text-dark uppercase tracking-tight">"{searchQuery}"</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
