
import React, { useState } from 'react';
import { CapProduct } from '../types';
import { GLOBAL_CONFIG } from '../constants';

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
    const message = `Hola, me interesa el modelo ${cap.nombre} que vi en su catálogo, quisiera saber el precio por mayor.`;
    const waUrl = `https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
            <span className="text-primary font-black text-[9px] uppercase tracking-[0.5em] mb-2 block">{cap.categoria}</span>
            <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tighter uppercase">
              {cap.nombre}
            </h2>
            <p className="text-2xl font-black text-primary mt-2 tracking-tighter">{cap.precio || 'Desde S/ 25.00'}</p>
            <p className="mt-4 text-gray-400 text-sm font-medium leading-relaxed italic">
              "{cap.descripcion}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50 pb-3">Análisis Técnico</h3>
            {specIcons.map((spec, i) => (
              <div key={i} className="flex items-center group bg-gray-50/50 p-3 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex-shrink-0 flex items-center justify-center text-primary">
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
            <div className="flex space-x-4 pt-6 border-t border-gray-100">
              <button 
                onClick={onAddToQuote}
                className={`flex-grow py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border ${isQuoted ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-dark text-dark hover:bg-dark hover:text-white'}`}
              >
                {isQuoted ? 'Añadido a lista' : 'Agregar a cotización'}
              </button>
              
              <button 
                onClick={handleDirectWhatsApp}
                className="px-8 bg-[#25D366] text-white rounded-xl shadow-lg hover:bg-[#128C7E] transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/></svg>
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
