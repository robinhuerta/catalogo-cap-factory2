import React from 'react';
import { CapProduct } from '../types';
import { GLOBAL_CONFIG } from '../constants';

interface CapCardProps {
  cap: CapProduct;
  onClick: (cap: CapProduct) => void;
  onAddToQuote: () => void;
  isQuoted?: boolean;
}

const CapCard: React.FC<CapCardProps> = ({ cap, onClick, onAddToQuote, isQuoted }) => {
  const handleAddToQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQuote();
  };

  const handleDirectWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hola, me interesa el modelo ${cap.nombre} que vi en su catálogo, quisiera saber el precio por mayor.`;
    const waUrl = `https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div 
      onClick={() => onClick(cap)}
      className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 animate-in fade-in"
    >
      <div className="aspect-square overflow-hidden relative bg-white flex items-center justify-center p-2">
        <img 
          src={cap.imagen} 
          alt={cap.nombre}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {cap.tags.length > 0 && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">
              {cap.tags[0]}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
            <button className="opacity-0 group-hover:opacity-100 bg-white text-dark text-[9px] font-black uppercase px-4 py-2 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Ver Detalles
            </button>
        </div>
      </div>
      
      <div className="p-3 md:p-5 flex flex-col flex-grow text-left">
        <span className="text-[8px] font-bold text-grey uppercase tracking-widest mb-1">
          SKU: {cap.id.padStart(4, '0')}
        </span>
        <h3 className="text-[12px] md:text-[14px] font-bold text-dark leading-tight tracking-tight uppercase mb-2 line-clamp-2 h-7 md:h-10">
          {cap.nombre}
        </h3>
        
        <div className="mt-auto pt-2 flex flex-col space-y-3">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-grey uppercase tracking-tighter line-through opacity-50">S/ 35.00</span>
            <span className="text-sm md:text-lg font-black text-primary leading-none">
              {cap.precio || 'Desde S/ 25.00'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={handleAddToQuote}
              className={`w-full py-2.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg border ${isQuoted ? 'bg-primary border-primary text-white' : 'bg-white border-dark text-dark hover:bg-dark hover:text-white'}`}
            >
              {isQuoted ? 'Añadido' : 'Solicitar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapCard;
