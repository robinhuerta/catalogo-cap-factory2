import React from 'react';
import { QuoteItem } from '../types';
import { GLOBAL_CONFIG } from '../constants';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuoteItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<QuoteItem>) => void;
}

const QuoteDrawer: React.FC<QuoteDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdate }) => {
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSendToWhatsApp = () => {
    if (items.length === 0) return;
    let message = GLOBAL_CONFIG.MESSAGE_PREFIX;
    items.forEach((item, i) => {
      message += `${i + 1}. *${item.nombre}*\n   Cantidad: ${item.quantity}`;
      if (item.color) message += `\n   Color/Notas: ${item.color}`;
      message += '\n\n';
    });
    message += 'Por favor contáctenme para coordinar los detalles. ¡Gracias!';
    window.open(`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-cream h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-grey-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-dark">Mi Cotización</h2>
            <p className="text-[10px] text-grey font-medium tracking-widest uppercase mt-0.5">
              {items.length} {items.length === 1 ? 'modelo' : 'modelos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-grey-light hover:bg-grey-border flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-grey-light rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-dark">Lista vacía</p>
                <p className="text-grey text-sm mt-1">Añade modelos desde el catálogo.</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-dark text-cream text-[10px] font-medium tracking-widest uppercase rounded-full hover:bg-primary transition-colors"
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-4 border border-grey-border">
                  {/* Item header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-grey-light rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-primary font-medium tracking-widest uppercase">{item.categoria}</p>
                      <p className="font-display text-[13px] font-bold text-dark leading-tight truncate">{item.nombre}</p>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-grey hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] text-grey font-medium uppercase tracking-widest block mb-1.5">Cantidad</label>
                      <div className="flex items-center border border-grey-border rounded-lg overflow-hidden bg-grey-light">
                        <button
                          onClick={() => onUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="w-8 h-8 flex items-center justify-center text-dark hover:text-primary transition-colors font-medium"
                        >−</button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => onUpdate(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="flex-1 bg-transparent text-center text-[12px] font-semibold text-dark focus:outline-none"
                        />
                        <button
                          onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
                          className="w-8 h-8 flex items-center justify-center text-dark hover:text-primary transition-colors font-medium"
                        >+</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] text-grey font-medium uppercase tracking-widest block mb-1.5">Color / Notas</label>
                      <input
                        type="text"
                        value={item.color || ''}
                        placeholder="Ej: Azul marino"
                        onChange={e => onUpdate(item.id, { color: e.target.value })}
                        className="w-full h-8 bg-grey-light border border-grey-border rounded-lg px-3 text-[11px] text-dark focus:outline-none focus:border-primary transition-colors placeholder:text-grey"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-grey-border bg-white">
            <div className="flex justify-between text-[11px] font-medium text-grey mb-4">
              <span>{items.length} modelos · {totalUnits} unidades</span>
            </div>
            <button
              onClick={handleSendToWhatsApp}
              className="w-full bg-dark hover:bg-primary text-cream py-3.5 rounded-xl text-[10px] font-medium tracking-widest uppercase transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/>
              </svg>
              Solicitar cotización
            </button>
            <p className="text-[9px] text-center text-grey mt-3 leading-relaxed">
              Recibirás una cotización formal según tu volumen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDrawer;
