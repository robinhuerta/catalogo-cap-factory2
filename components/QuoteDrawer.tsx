
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
  const handleSendToWhatsApp = () => {
    if (items.length === 0) return;
    
    let message = GLOBAL_CONFIG.MESSAGE_PREFIX;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.nombre}*\n`;
      message += `   - Modelo: ${item.categoria}\n`;
      message += `   - Cantidad: ${item.quantity}\n`;
      if (item.color) message += `   - Color/Notas: ${item.color}\n`;
      message += `\n`;
    });
    message += "Por favor, contáctenme para coordinar los detalles. ¡Gracias!";
    
    const url = `https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between text-left">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">Mi Cotización</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{items.length} modelos seleccionados</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tu lista está vacía</h3>
              <p className="text-gray-400 mt-2 text-sm">Explora el catálogo y añade las muestras que te interesen.</p>
              <button onClick={onClose} className="mt-8 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all">Volver al catálogo</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex flex-col space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center text-left">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em]">{item.categoria}</span>
                    <h4 className="text-sm font-black text-gray-900 leading-tight">{item.nombre}</h4>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Cantidad</label>
                    <div className="flex items-center bg-gray-50 rounded-lg p-1">
                      <button 
                        onClick={() => onUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => onUpdate(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-center text-xs font-black text-gray-900 border-none focus:ring-0"
                      />
                      <button 
                        onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Color / Notas</label>
                    <input 
                      type="text" 
                      value={item.color || ''} 
                      placeholder="Ej: Azul Marino"
                      onChange={(e) => onUpdate(item.id, { color: e.target.value })}
                      className="w-full h-10 bg-gray-50 rounded-lg px-3 text-xs font-medium text-gray-900 border-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="h-px bg-gray-100 w-full mt-2"></div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-gray-50">
            <div className="mb-8 space-y-3 text-left">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Total Modelos:</span>
                <span className="text-gray-900">{items.length}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Total Unidades:</span>
                <span className="text-gray-900">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
            </div>
            <button 
            onClick={handleSendToWhatsApp}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/></svg>
            <span>SOLICITAR COTIZACIÓN</span>
          </button>
            <p className="text-[9px] text-center text-gray-400 mt-6 font-bold uppercase tracking-widest leading-relaxed">
              Recibirá una cotización formal con costos unitarios según el volumen de producción solicitado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDrawer;
