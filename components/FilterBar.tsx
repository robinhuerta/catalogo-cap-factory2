import React from 'react';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ categories, activeCategory, onCategoryChange, searchQuery }) => {
  return (
    <div className="bg-cream border-b border-grey-border sticky top-[81px] z-30 overflow-x-auto">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 py-3 flex items-center gap-2 min-w-max sm:min-w-0">

        {['Todas', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-medium tracking-widest uppercase whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-dark border-dark text-cream'
                : 'bg-white border-grey-border text-grey hover:border-dark hover:text-dark'
            }`}
          >
            {cat}
          </button>
        ))}

        {searchQuery && (
          <span className="ml-2 text-[10px] text-grey font-medium tracking-wide italic">
            "{searchQuery}"
          </span>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
