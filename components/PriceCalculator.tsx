import React, { useState, useMemo } from 'react';
import { GLOBAL_CONFIG } from '../constants';

const BASE_PRICE = 16;

const ADDONS = [
  { id: 'bordado',  label: 'Bordado 3D + 2 planas',      extra: 3.00,  quote: false },
  { id: 'etiqueta', label: 'Etiqueta personalizada',      extra: 0.50,  quote: false },
  { id: 'cesgo',    label: 'Estampado interno (cesgo)',   extra: 1.00,  quote: false },
];

const ADDONS_QUOTE = [
  { id: 'placa',  label: 'Placa metálica' },
  { id: 'parche', label: 'Parche bordado' },
  { id: 'pvc',    label: 'PVC 3D' },
  { id: 'goma',   label: 'Aplique de goma / rubber' },
  { id: 'cuero',  label: 'Parche de cuero' },
];

const TIERS = [
  { min: 50,   max: 99,   discount: 0,   delivery: '10–15 días hábiles' },
  { min: 100,  max: 299,  discount: 8,   delivery: '10–15 días hábiles' },
  { min: 300,  max: 499,  discount: 15,  delivery: '15–20 días hábiles' },
  { min: 500,  max: 999,  discount: 22,  delivery: '20–25 días hábiles' },
  { min: 1000, max: 2999, discount: 30,  delivery: '25–35 días hábiles' },
  { min: 3000, max: Infinity, discount: 38, delivery: '35–50 días hábiles' },
];

const getTier = (qty: number) =>
  TIERS.find(t => qty >= t.min && qty <= t.max) ?? TIERS[TIERS.length - 1];

const fmt = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Props {
  onGoToCatalog: () => void;
}

const PriceCalculator: React.FC<Props> = ({ onGoToCatalog }) => {
  const [quantity, setQuantity] = useState(100);
  const [activeAddons, setActiveAddons] = useState<Set<string>>(new Set());
  const [activeQuotes, setActiveQuotes] = useState<Set<string>>(new Set());

  const toggleAddon = (id: string) => {
    setActiveAddons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleQuote = (id: string) => {
    setActiveQuotes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tier = getTier(quantity);
  const addonsTotal = ADDONS.filter(a => activeAddons.has(a.id)).reduce((sum, a) => sum + a.extra, 0);
  const unitPriceBase = BASE_PRICE + addonsTotal;
  const unitPrice = unitPriceBase * (1 - tier.discount / 100);
  const totalPrice = unitPrice * quantity;
  const nextTier = TIERS.find(t => t.min > quantity);

  const waMessage = useMemo(() => {
    const selectedAddons = ADDONS.filter(a => activeAddons.has(a.id));
    const selectedQuotes = ADDONS_QUOTE.filter(a => activeQuotes.has(a.id));
    const lines = [
      `Hola, quisiera un presupuesto:`,
      `• Cantidad: ${quantity} unidades`,
      selectedAddons.length
        ? `• Incluye: ${selectedAddons.map(a => a.label).join(', ')}`
        : `• Sin personalización`,
      selectedQuotes.length
        ? `• A cotizar: ${selectedQuotes.map(a => a.label).join(', ')}`
        : null,
      `• Precio ref. base: ${fmt(unitPrice)} / ud`,
      `• Total ref.: ${fmt(totalPrice)}`,
    ].filter(Boolean).join('%0A');
    return `https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=${lines}`;
  }, [activeAddons, activeQuotes, quantity, unitPrice, totalPrice]);

  const handleQtyInput = (val: string) => {
    const n = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setQuantity(Math.max(50, Math.min(10000, n)));
  };

  return (
    <div className="bg-white border border-grey-border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="bg-dark px-8 md:px-12 py-10">
        <p className="text-[9px] text-primary font-medium tracking-[0.5em] uppercase mb-2">Cotizador instantáneo</p>
        <h3 className="font-display text-3xl font-bold text-cream leading-tight">
          Calcula tu pedido<br />en segundos.
        </h3>
        <p className="text-cream/50 text-sm mt-3">Precios referenciales sin IGV. Confirmación final por WhatsApp.</p>
      </div>

      <div className="px-8 md:px-12 py-10 grid lg:grid-cols-2 gap-10">

        {/* Left — controls */}
        <div className="space-y-8">

          {/* Quantity */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-[10px] font-medium text-grey uppercase tracking-widest">Cantidad de unidades</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(50, q - (q > 100 ? 50 : 10)))}
                  className="w-7 h-7 rounded-full border border-grey-border flex items-center justify-center text-grey hover:border-dark hover:text-dark transition-colors text-sm font-medium"
                >−</button>
                <input
                  type="text"
                  value={quantity}
                  onChange={e => handleQtyInput(e.target.value)}
                  className="w-20 text-center font-display text-xl font-bold text-dark border border-grey-border rounded-lg py-1 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={() => setQuantity(q => Math.min(10000, q + (q >= 100 ? 50 : 10)))}
                  className="w-7 h-7 rounded-full border border-grey-border flex items-center justify-center text-grey hover:border-dark hover:text-dark transition-colors text-sm font-medium"
                >+</button>
              </div>
            </div>
            <input
              type="range"
              min={50} max={3000} step={50}
              value={Math.min(quantity, 3000)}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between mt-1.5">
              {TIERS.slice(0, -1).map(t => (
                <span
                  key={t.min}
                  className={`text-[8px] font-medium transition-colors ${quantity >= t.min && quantity <= t.max ? 'text-primary font-bold' : 'text-grey/60'}`}
                >
                  {t.min >= 1000 ? `${t.min / 1000}k` : t.min}
                </span>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="text-[10px] font-medium text-grey uppercase tracking-widest block mb-1">Personalización</label>
            <p className="text-[10px] text-grey/60 mb-4">Precio base <strong className="text-dark">S/ {BASE_PRICE.toFixed(2)}</strong> · Selecciona los extras que necesitas</p>
            <div className="space-y-2.5">
              {ADDONS.map(addon => {
                const active = activeAddons.has(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                      active
                        ? 'bg-dark border-dark text-cream'
                        : 'bg-white border-grey-border text-dark hover:border-dark/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                        active ? 'bg-primary border-primary' : 'border-grey-border'
                      }`}>
                        {active && (
                          <svg className="w-2.5 h-2.5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] font-medium">{addon.label}</span>
                    </div>
                    <span className={`text-[11px] font-semibold ml-4 flex-shrink-0 ${active ? 'text-primary' : 'text-grey'}`}>
                      +S/ {addon.extra.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Price breakdown */}
            {activeAddons.size > 0 && (
              <div className="mt-4 bg-grey-light rounded-xl px-4 py-3 text-[11px] text-grey space-y-1">
                <div className="flex justify-between">
                  <span>Gorra base</span>
                  <span className="text-dark font-medium">S/ {BASE_PRICE.toFixed(2)}</span>
                </div>
                {ADDONS.filter(a => activeAddons.has(a.id)).map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span>{a.label}</span>
                    <span className="text-dark font-medium">+ S/ {a.extra.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-grey-border pt-1.5 mt-1.5 font-semibold text-dark">
                  <span>Subtotal/ud (sin descuento)</span>
                  <span>S/ {unitPriceBase.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Extras a cotizar */}
            <div className="mt-6">
              <label className="text-[10px] font-medium text-grey uppercase tracking-widest block mb-1">Extras a cotizar</label>
              <p className="text-[10px] text-grey/60 mb-3">Precio según volumen · Se incluyen en tu mensaje de WhatsApp</p>
              <div className="flex flex-wrap gap-2">
                {ADDONS_QUOTE.map(addon => {
                  const active = activeQuotes.has(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleQuote(addon.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white border-grey-border text-grey hover:border-primary/50 hover:text-dark'
                      }`}
                    >
                      {active && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {addon.label}
                    </button>
                  );
                })}
              </div>
              {activeQuotes.size > 0 && (
                <p className="mt-2.5 text-[10px] text-primary font-medium">
                  {activeQuotes.size} extra{activeQuotes.size > 1 ? 's' : ''} se incluirá{activeQuotes.size > 1 ? 'n' : ''} en tu cotización por WhatsApp.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — result */}
        <div className="flex flex-col">
          <div className="bg-cream border border-grey-border rounded-xl p-7 flex-1">

            {tier.discount > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                </svg>
                {tier.discount}% descuento por volumen
              </div>
            )}

            <div className="mb-6">
              <p className="text-[9px] text-grey uppercase tracking-widest font-medium mb-1">Precio por unidad</p>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-dark">{fmt(unitPrice)}</span>
                {tier.discount > 0 && (
                  <span className="text-grey/50 text-sm line-through">{fmt(unitPriceBase)}</span>
                )}
              </div>
            </div>

            <div className="border-t border-grey-border pt-5 mb-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-grey uppercase tracking-widest font-medium">Total estimado</span>
                <span className="font-display text-xl font-bold text-dark">{fmt(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-grey uppercase tracking-widest font-medium">Tiempo de entrega</span>
                <span className="text-[12px] font-semibold text-dark">{tier.delivery}</span>
              </div>
            </div>

            {nextTier && (
              <div className="bg-white border border-grey-border rounded-lg px-4 py-3 flex items-start gap-2.5 mb-5">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <p className="text-[10px] text-grey leading-relaxed">
                  Con <strong className="text-dark">{nextTier.min.toLocaleString()} unidades</strong> obtienes{' '}
                  <strong className="text-primary">{nextTier.discount}% de descuento</strong>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <a
                href={waMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-dark text-cream text-[11px] font-medium tracking-widest uppercase px-6 py-3.5 rounded-full hover:bg-primary transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z" />
                </svg>
                Solicitar este presupuesto
              </a>
              <button
                onClick={onGoToCatalog}
                className="flex items-center justify-center gap-2 border border-grey-border text-grey text-[11px] font-medium tracking-widest uppercase px-6 py-3 rounded-full hover:border-dark hover:text-dark transition-colors"
              >
                Ver modelos en el catálogo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tiers table */}
      <div className="px-8 md:px-12 pb-10">
        <p className="text-[9px] text-grey uppercase tracking-widest font-medium mb-4">Estructura de descuentos por volumen</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-grey-border">
                <th className="text-left text-[9px] text-grey uppercase tracking-widest font-medium pb-2 pr-6">Rango</th>
                <th className="text-left text-[9px] text-grey uppercase tracking-widest font-medium pb-2 pr-6">Descuento</th>
                <th className="text-left text-[9px] text-grey uppercase tracking-widest font-medium pb-2">Entrega est.</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map(t => {
                const active = quantity >= t.min && quantity <= t.max;
                return (
                  <tr key={t.min} className={`border-b border-grey-border last:border-0 ${active ? 'bg-primary/5' : ''}`}>
                    <td className={`py-2.5 pr-6 text-[12px] font-medium ${active ? 'text-dark' : 'text-grey'}`}>
                      {t.max === Infinity ? `${t.min.toLocaleString()}+` : `${t.min.toLocaleString()} – ${t.max.toLocaleString()}`} uds
                      {active && <span className="ml-2 text-[9px] text-primary font-bold uppercase tracking-wider">← actual</span>}
                    </td>
                    <td className={`py-2.5 pr-6 text-[12px] font-semibold ${active ? 'text-primary' : 'text-grey'}`}>
                      {t.discount === 0 ? 'Precio base' : `−${t.discount}%`}
                    </td>
                    <td className={`py-2.5 text-[11px] ${active ? 'text-dark' : 'text-grey'}`}>{t.delivery}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
