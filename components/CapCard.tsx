import React from 'react';
import { CapProduct } from '../types';

const formatPrecio = (p?: string) => {
  if (!p) return 'Cotizar';
  if (p.toLowerCase().includes('s/') || p.toLowerCase().includes('cotizar')) return p;
  return `S/ ${p}`;
};

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

  return (
    <div
      onClick={() => onClick(cap)}
      className="group cursor-pointer flex flex-col bg-white border border-grey-border hover:border-primary/40 transition-all duration-300 rounded-xl overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative bg-grey-light">
        <img
          src={cap.imagen}
          alt={cap.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Tag */}
        {cap.tags[0] && (
          <span className="absolute top-3 left-3 bg-dark text-cream text-[9px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-full">
            {cap.tags[0]}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-all duration-300 flex items-end justify-center pb-5">
          <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-cream text-dark text-[10px] font-medium tracking-widest uppercase px-5 py-2 rounded-full shadow-lg">
            Ver detalles
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-[9px] text-grey font-medium tracking-widest uppercase mb-1">{cap.categoria}</p>
          <h3 className="font-display text-[15px] font-bold text-dark leading-tight tracking-tight">
            {cap.nombre}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <p className="text-[10px] text-grey font-medium">MOQ {cap.moq} uds</p>
            {cap.precio_antes ? (
              <div className="flex items-baseline gap-1.5">
                <p className="text-[12px] font-bold text-primary">{formatPrecio(cap.precio)}</p>
                <p className="text-[10px] text-grey line-through">{formatPrecio(cap.precio_antes)}</p>
              </div>
            ) : (
              <p className="text-[12px] font-semibold text-dark">{formatPrecio(cap.precio)}</p>
            )}
          </div>

          <button
            onClick={handleAddToQuote}
            className={`flex-shrink-0 h-9 px-4 text-[10px] font-medium tracking-widest uppercase rounded-full border transition-all duration-200 ${
              isQuoted
                ? 'bg-primary border-primary text-cream'
                : 'bg-white border-grey-border text-dark hover:border-dark'
            }`}
          >
            {isQuoted ? '✓ Añadido' : 'Cotizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapCard;
