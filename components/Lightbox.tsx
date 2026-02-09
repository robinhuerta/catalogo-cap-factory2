
import React, { useState } from 'react';
import { CapProduct } from '../types';

interface LightboxProps {
  cap: CapProduct | null;
  onClose: () => void;
  onAddToQuote: () => void;
  isQuoted: boolean;
}

const Lightbox: React.FC<LightboxProps> = ({ cap, onClose, onAddToQuote, isQuoted }) => {
  const [copied, setCopied] = useState(false);
  
  if (!cap) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?product=${cap.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectWhatsApp = () => {
    const phoneNumber = "51999999999";
    const message = `Hola, me interesa el modelo ${cap.nombre} que vi en su catálogo, quisiera saber el precio por mayor`;
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const specIcons = [
    { label: 'Tela Base', value: cap.fichaTecnica.tela, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Bordado / Arte', value: cap.fichaTecnica.bordado, icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { label: 'Visera', value: cap.fichaTecnica.visera, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Broche / Ajuste', value: cap.fichaTecnica.broche, icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    { label: 'Acabados Especiales', value: cap.fichaTecnica.acabados, icon: 'M9 12l2 2 4-4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="w-full md:w-1/2 bg-[#F9F9F9] flex items-center justify-center p-10 overflow-hidden border-r border-gray-100 relative">
          <img src={cap.imagen} alt={cap.nombre} className="w-full h-full object-contain drop-shadow-2xl scale-105" />
          <div className="absolute top-6 left-6 flex flex-col gap-3">
             <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-gray-100">
                <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Mínimo</p>
                <p className="text-sm font-black text-black">{cap.moq} pzs</p>
             </div>
             <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-gray-100">
                <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Entrega</p>
                <p className="text-sm font-black text-black">{cap.entrega}</p>
             </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-10 md:p-12 overflow-y-auto bg-white text-left">
          <div className="mb-10">
            <span className="text-blue-600 text-[9px] font-black uppercase tracking-[0.4em] mb-3 block">Ficha Técnica de Producción / {cap.categoria}</span>
            <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tighter uppercase">
              {cap.nombre}
            </h2>
            <p className="mt-5 text-gray-400 text-sm font-medium leading-relaxed italic">
              "{cap.descripcion}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50 pb-3">Análisis Técnico</h3>
            {specIcons.map((spec, i) => (
              <div key={i} className="flex items-center group bg-gray-50/50 p-3 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex-shrink-0 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={spec.icon} />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">{spec.label}</h4>
                  <p className="text-gray-900 font-bold text-[11px] leading-tight">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onAddToQuote}
                disabled={isQuoted}
                className={`h-14 rounded-xl flex items-center justify-center font-black text-[9px] uppercase tracking-[0.1em] transition-all shadow-lg ${isQuoted ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-black text-white hover:bg-blue-600'}`}
              >
                {isQuoted ? 'SELECCIONADA' : 'AÑADIR A LISTA'}
              </button>
              <button 
                onClick={handleDirectWhatsApp}
                className="h-14 rounded-xl flex items-center justify-center font-black text-[9px] uppercase tracking-[0.1em] transition-all bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg shadow-green-500/20"
              >
                COTIZAR WHATSAPP
              </button>
            </div>
            <button onClick={handleCopyLink} className={`h-14 rounded-xl flex items-center justify-center font-black text-[9px] uppercase tracking-[0.1em] transition-all border ${copied ? 'bg-green-500 border-green-500 text-white' : 'border-gray-100 text-gray-500 hover:border-black hover:text-black'}`}>
              {copied ? 'ENLACE COPIADO' : 'COPIAR ENLACE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
