import React, { useState } from 'react';
import { CapProduct } from '../types';
import { GLOBAL_CONFIG } from '../constants';

interface LightboxProps {
  cap: CapProduct | null;
  onClose: () => void;
  onAddToQuote: () => void;
  isQuoted: boolean;
}

const SPEC_ICONS = [
  { key: 'tela',    label: 'Tela base',         icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { key: 'bordado', label: 'Bordado / arte',     icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { key: 'visera',  label: 'Visera',             icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { key: 'broche',  label: 'Broche / ajuste',    icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { key: 'acabados',label: 'Acabados especiales', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
] as const;

const Lightbox: React.FC<LightboxProps> = ({ cap, onClose, onAddToQuote, isQuoted }) => {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const allImages = [cap?.imagen, ...(cap?.imagenes || [])].filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);

  // Reset active image when product changes
  React.useEffect(() => { setActiveImg(0); }, [cap?.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (!cap) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?product=${cap.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = `Hola Cap Factory, me interesa este modelo:\n\n*${cap.nombre}*\nCategoría: ${cap.categoria}\n${cap.precio ? `Precio visto: ${cap.precio}\n` : ''}Foto: ${cap.imagen}\n\n¿Podrían cotizarme por mayor?`;
    window.open(`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-cream rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image panel */}
        <div className="w-full md:w-[60%] bg-grey-light flex flex-col relative flex-shrink-0 select-none">
          {/* Zoomable area */}
          <div
            className="flex-1 flex items-center justify-center p-6 overflow-hidden relative"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            style={{ cursor: zoom ? 'crosshair' : 'default', minHeight: '280px' }}
          >
            <img
              src={allImages[activeImg] || cap.imagen}
              alt={cap.nombre}
              className="w-full max-h-[380px] md:max-h-[500px] object-contain drop-shadow-xl transition-transform duration-150"
              style={zoom ? { transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            />
            {!zoom && (
              <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-[9px] text-grey font-medium shadow-sm pointer-events-none">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v4m-2-2h4" />
                </svg>
                Zoom
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
                <p className="text-[7px] text-grey font-medium uppercase tracking-widest">MOQ</p>
                <p className="text-sm font-display font-bold text-dark">{cap.moq} uds</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
                <p className="text-[7px] text-grey font-medium uppercase tracking-widest">Entrega</p>
                <p className="text-sm font-display font-bold text-dark">{cap.entrega}</p>
              </div>
            </div>
          </div>

          {/* Thumbnails — fuera del área de zoom */}
          {allImages.length > 1 && (
            <div className="flex justify-center gap-2 px-4 py-3 bg-grey-light/80 border-t border-grey-border flex-wrap">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setZoom(false); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImg === i ? 'border-primary' : 'border-transparent hover:border-grey-border'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="w-full md:flex-1 p-8 md:p-10 overflow-y-auto bg-white text-left flex flex-col">
          <div className="mb-6">
            <p className="text-[9px] text-primary font-medium tracking-[0.4em] uppercase mb-2">{cap.categoria}</p>
            <h2 className="font-display text-3xl font-bold text-dark leading-tight tracking-tight">{cap.nombre}</h2>
            {cap.precio_antes ? (
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-xl font-bold text-primary">{cap.precio.toLowerCase().includes('s/') ? cap.precio : `S/ ${cap.precio}`}</p>
                <p className="text-sm text-grey line-through">{cap.precio_antes.toLowerCase().includes('s/') ? cap.precio_antes : `S/ ${cap.precio_antes}`}</p>
                <span className="text-[10px] bg-primary text-cream font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Oferta</span>
              </div>
            ) : (
              <p className="text-xl font-semibold text-dark mt-1">
                {cap.precio
                  ? (cap.precio.toLowerCase().includes('s/') ? cap.precio : `S/ ${cap.precio}`)
                  : 'Cotizar precio'}
              </p>
            )}
            <p className="mt-3 text-grey text-sm leading-relaxed">{cap.descripcion}</p>
          </div>

          {/* Specs */}
          <div className="border-t border-grey-border pt-5 mb-6">
            <p className="text-[9px] text-grey font-medium tracking-widest uppercase mb-4">Ficha técnica</p>
            <div className="grid gap-2.5">
              {SPEC_ICONS.map(spec => (
                <div key={spec.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-grey-light flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={spec.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] text-grey font-medium uppercase tracking-widest">{spec.label}</p>
                    <p className="text-[12px] font-semibold text-dark">{cap.fichaTecnica[spec.key as keyof typeof cap.fichaTecnica]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-grey-border">
            <div className="flex gap-2">
              <button
                onClick={onAddToQuote}
                className={`flex-1 py-3 rounded-xl text-[10px] font-medium tracking-widest uppercase border transition-all ${
                  isQuoted
                    ? 'bg-primary border-primary text-cream'
                    : 'bg-white border-dark text-dark hover:bg-dark hover:text-cream'
                }`}
              >
                {isQuoted ? '✓ Añadido' : 'Agregar a cotización'}
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-12 h-12 bg-[#25D366] hover:bg-[#20b858] rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/>
                </svg>
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className={`py-2.5 rounded-xl text-[10px] font-medium tracking-widest uppercase border transition-all ${
                copied ? 'bg-green-500 border-green-500 text-white' : 'border-grey-border text-grey hover:border-dark hover:text-dark'
              }`}
            >
              {copied ? 'Enlace copiado ✓' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
