import React, { useState, useRef, useEffect } from 'react';
import { recolorCap } from '../lib/recolorCap';
import capBase5p from '../images/gorra-snapback-negra.jpg';
import capBase6p from '../images/gorra-6paneles-trucker.jpg';

const CAP_MODELS = [
  { id: '5p', name: '5 Paneles', img: capBase5p },
  { id: '6p', name: '6 Paneles', img: capBase6p },
];

const CAP_COLORS = [
  { name: 'Negro',      hex: '#1a1a1a' },
  { name: 'Blanco',     hex: '#ffffff' },
  { name: 'Rojo',       hex: '#c0392b' },
  { name: 'Azul Navy',  hex: '#1a2744' },
  { name: 'Verde',      hex: '#1e6b3c' },
  { name: 'Gris',       hex: '#6b7280' },
  { name: 'Amarillo',   hex: '#f59e0b' },
  { name: 'Celeste',    hex: '#3b82f6' },
  { name: 'Bordo',      hex: '#7b1c2e' },
  { name: 'Naranja',    hex: '#ea580c' },
  { name: 'Rosado',     hex: '#ec4899' },
  { name: 'Beige',      hex: '#d4b896' },
  { name: 'Morado',     hex: '#7c3aed' },
  { name: 'Terracota',  hex: '#c2623f' },
];

const EMBROIDERY_COLORS = [
  { name: 'Blanco',    hex: '#ffffff' },
  { name: 'Negro',     hex: '#1a1a1a' },
  { name: 'Dorado',    hex: '#d4a017' },
  { name: 'Plateado',  hex: '#a8a9ad' },
  { name: 'Rojo',      hex: '#c0392b' },
  { name: 'Azul',      hex: '#1a2744' },
  { name: 'Amarillo',  hex: '#f59e0b' },
  { name: 'Verde',     hex: '#1e6b3c' },
  { name: 'Naranja',   hex: '#ea580c' },
  { name: 'Rosado',    hex: '#ec4899' },
];

const CapSimulator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [modelId, setModelId] = useState(CAP_MODELS[0].id);
  const [capColor, setCapColor] = useState('#1a1a1a');
  const [capColorName, setCapColorName] = useState('Negro');
  const [capImg, setCapImg] = useState(CAP_MODELS[0].img);
  const [embColor, setEmbColor] = useState('#ffffff');
  const [embColorName, setEmbColorName] = useState('Blanco');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(85);
  const fileRef = useRef<HTMLInputElement>(null);

  const modelBase = CAP_MODELS.find(m => m.id === modelId)!.img;

  useEffect(() => {
    let active = true;
    recolorCap(modelBase, capColor).then(dataUrl => {
      if (active) setCapImg(dataUrl);
    });
    return () => { active = false; };
  }, [capColor, modelBase]);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hola Cap Factory! Quiero una gorra con:\n\n` +
      `🎨 Color de gorra: ${capColorName}\n` +
      `🧵 Color de bordado: ${embColorName}\n` +
      `${logo ? '✅ Logo adjunto\n' : ''}` +
      `\n¿Me pueden cotizar?`
    );
    window.open(`https://wa.me/51930404573?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-8 pb-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-grey mb-6">
          <button onClick={onBack} className="hover:text-dark transition-colors">Inicio</button>
          <span>/</span>
          <span className="text-dark">Personalizar gorra</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-dark leading-[0.9] uppercase mb-2">
          Diseña tu <span className="text-primary">gorra.</span>
        </h1>
        <p className="text-grey text-sm mb-10">Elige colores y sube tu logo para ver cómo quedará.</p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Preview ── */}
          <div className="sticky top-24">
            <div className="relative bg-white border border-grey-border rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: 420 }}>

              {/* Gorra base */}
              <div className="relative" style={{ width: 420, height: 340 }}>

                {/* Imagen renderizada de la gorra en el color elegido */}
                <img
                  src={capImg}
                  alt="Gorra"
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ zIndex: 2 }}
                  draggable={false}
                />

                {/* Logo encima en el panel frontal — limitado siempre a esta área */}
                {logo && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      zIndex: 3,
                      left: '33%',
                      top: '43%',
                      width: '34%',
                      height: '24%',
                    }}
                  >
                    <div className="flex items-center justify-center" style={{ width: `${logoScale}%`, height: `${logoScale}%` }}>
                      <img
                        src={logo}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain drop-shadow-sm"
                        style={{
                          filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.3))`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Badge color gorra */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 border border-grey-border rounded-full px-3 py-1.5">
                <div className="w-3 h-3 rounded-full border border-grey-border" style={{ backgroundColor: capColor }} />
                <span className="text-[10px] font-medium text-dark">{capColorName}</span>
              </div>

              {/* Badge color bordado */}
              {logo && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 border border-grey-border rounded-full px-3 py-1.5">
                  <div className="w-3 h-3 rounded-full border border-grey-border" style={{ backgroundColor: embColor }} />
                  <span className="text-[10px] font-medium text-dark">{embColorName}</span>
                </div>
              )}
            </div>

            {/* Nota */}
            <p className="text-[9px] text-grey text-center mt-3">
              Vista aproximada — los colores reales pueden variar ligeramente.
            </p>
          </div>

          {/* ── Controles ── */}
          <div className="space-y-8">

            {/* Modelo de gorra */}
            <div>
              <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">
                Modelo — <span className="text-dark font-semibold">{CAP_MODELS.find(m => m.id === modelId)!.name}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {CAP_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`px-4 py-2 rounded-full text-[11px] font-medium transition-all ${
                      modelId === m.id
                        ? 'bg-dark text-cream'
                        : 'bg-grey-light text-grey hover:text-dark'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color de gorra */}
            <div>
              <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">
                Color de gorra — <span className="text-dark font-semibold">{capColorName}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {CAP_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => { setCapColor(c.hex); setCapColorName(c.name); }}
                    title={c.name}
                    className={`w-9 h-9 rounded-full transition-all hover:scale-110 ${
                      capColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-dark scale-110'
                        : 'ring-1 ring-grey-border'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Color de bordado */}
            <div>
              <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">
                Color de bordado — <span className="text-dark font-semibold">{embColorName}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {EMBROIDERY_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => { setEmbColor(c.hex); setEmbColorName(c.name); }}
                    title={c.name}
                    className={`w-9 h-9 rounded-full transition-all hover:scale-110 ${
                      embColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-dark scale-110'
                        : 'ring-1 ring-grey-border'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Subir logo */}
            <div>
              <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">Tu logo</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-grey-border rounded-xl p-6 flex items-center gap-5 cursor-pointer hover:border-primary transition-colors group"
              >
                <div className="w-16 h-16 rounded-xl bg-grey-light flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logo ? (
                    <img src={logo} className="w-full h-full object-contain p-1" alt="Logo" />
                  ) : (
                    <svg className="w-7 h-7 text-grey group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark group-hover:text-primary transition-colors">
                    {logo ? 'Cambiar logo' : 'Subir tu logo'}
                  </p>
                  <p className="text-[10px] text-grey mt-0.5">PNG con fondo transparente recomendado</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>

              {/* Tamaño del logo */}
              {logo && (
                <div className="mt-4">
                  <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-2">
                    Tamaño del logo — <span className="text-dark">{logoScale}%</span>
                  </p>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={logoScale}
                    onChange={e => setLogoScale(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="bg-white border border-grey-border rounded-xl p-5 space-y-3">
              <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase">Resumen de tu pedido</p>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-grey">Color de gorra</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full ring-1 ring-grey-border" style={{ backgroundColor: capColor }} />
                  <span className="text-[11px] font-semibold text-dark">{capColorName}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-grey">Color de bordado</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full ring-1 ring-grey-border" style={{ backgroundColor: embColor }} />
                  <span className="text-[11px] font-semibold text-dark">{embColorName}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-grey">Logo</span>
                <span className="text-[11px] font-semibold text-dark">{logo ? '✓ Subido' : 'Sin logo'}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleWhatsApp}
              className="w-full py-4 bg-dark text-cream text-[11px] font-medium tracking-widest uppercase rounded-full hover:bg-primary transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/>
              </svg>
              Pedir por WhatsApp
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CapSimulator;
