
import React, { useState } from 'react';
import { CapProduct } from '../types';

interface CapCardProps {
  cap: CapProduct;
  onClick: (cap: CapProduct) => void;
  onAddToQuote: () => void;
  isQuoted?: boolean;
}

const CapCard: React.FC<CapCardProps> = ({ cap, onClick, onAddToQuote, isQuoted }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQuote();
  };

  const handleDirectWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = "51999999999";
    const message = `Hola, me interesa el modelo ${cap.nombre} que vi en su catálogo, quisiera saber el precio por mayor`;
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(cap);
  };

  return (
    <div 
      onClick={toggleExpand}
      className={`group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-[1.5rem] p-4 transition-all duration-500 hover:shadow-2xl hover:border-blue-100 animate-in fade-in duration-700 ${isExpanded ? 'ring-2 ring-blue-600/10 shadow-xl' : ''}`}
    >
      <div className="aspect-[1/1] overflow-hidden relative bg-[#F8F8F8] rounded-xl transition-all duration-500">
        <img 
          src={cap.imagen} 
          alt={cap.nombre}
          className="w-full h-full object-contain p-4 transition-transform duration-[1s] group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute top-3 left-3">
          <div className="bg-black/80 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-lg">
            {cap.tags[0] || 'Muestra'}
          </div>
        </div>

        <button 
          onClick={handleImageClick}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
          title="Ver en grande"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      <div className="mt-5 text-left">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[14px] font-black text-gray-900 leading-tight tracking-tight uppercase">
            {cap.nombre}
          </h3>
          <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
             <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        
        <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-4">
          {cap.categoria}
        </p>

        {/* Sección Expandible */}
        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-4 pt-2 border-t border-gray-50 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Mínimo Producción</p>
                <p className="text-[11px] font-black text-gray-900">{cap.moq} Unidades</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Tiempo Entrega</p>
                <p className="text-[11px] font-black text-gray-900">{cap.entrega}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 pb-1">Ficha Técnica</p>
              {[
                { label: 'Tela', val: cap.fichaTecnica.tela },
                { label: 'Bordado', val: cap.fichaTecnica.bordado },
                { label: 'Visera', val: cap.fichaTecnica.visera },
                { label: 'Broche', val: cap.fichaTecnica.broche }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-gray-400 uppercase tracking-tighter">{spec.label}:</span>
                  <span className="font-black text-gray-900 text-right ml-4 leading-tight">{spec.val}</span>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic border-l-2 border-blue-600 pl-3 py-1">
              {cap.descripcion}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button 
            onClick={handleAddToQuote}
            className={`py-3 text-[8px] font-black uppercase tracking-[0.1em] transition-all duration-300 border rounded-xl ${isQuoted ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border-gray-200 text-gray-900 hover:border-black hover:bg-black hover:text-white'}`}
          >
            {isQuoted ? 'AÑADIDO' : 'A LISTA'}
          </button>
          
          <button 
            onClick={handleDirectWhatsApp}
            className="py-3 bg-[#25D366] text-white text-[8px] font-black uppercase tracking-[0.1em] rounded-xl shadow-md hover:shadow-xl hover:bg-[#128C7E] transition-all flex items-center justify-center space-x-1"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/></svg>
            <span>WHATSAPP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapCard;
