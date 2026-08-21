import React, { useState, useRef, useEffect } from 'react';
import { TREBOL_THREADS, ThreadColor } from '../lib/threads';

interface ThreadSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const ThreadSelect: React.FC<ThreadSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse existing selection
  const selectedThreads = value.split(',').map(s => s.trim()).filter(Boolean);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredThreads = TREBOL_THREADS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.code.includes(search)
  );

  const toggleThread = (thread: ThreadColor) => {
    const threadString = `${thread.code} (${thread.name})`;
    let newSelection;
    if (selectedThreads.includes(threadString)) {
      newSelection = selectedThreads.filter(t => t !== threadString);
    } else {
      newSelection = [...selectedThreads, threadString];
    }
    onChange(newSelection.join(', '));
  };

  const removeThread = (e: React.MouseEvent, threadString: string) => {
    e.stopPropagation();
    onChange(selectedThreads.filter(t => t !== threadString).join(', '));
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Input / Trigger */}
      <div 
        className="min-h-[34px] border border-grey-border rounded-lg px-2.5 py-1.5 text-xs text-dark bg-white cursor-pointer hover:border-primary transition-colors flex flex-wrap gap-1.5 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedThreads.length === 0 ? (
          <span className="text-grey">Seleccionar Hilos...</span>
        ) : (
          selectedThreads.map(t => {
            const code = t.split(' ')[0];
            const threadData = TREBOL_THREADS.find(x => x.code === code);
            return (
              <span key={t} className="bg-grey-light text-dark px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1.5 border border-grey-border">
                {threadData && (
                  <span className="w-2.5 h-2.5 rounded-full inline-block border border-dark/20" style={{ backgroundColor: threadData.hex }} />
                )}
                {t}
                <button 
                  onClick={(e) => removeThread(e, t)}
                  className="ml-0.5 text-grey hover:text-red-500 font-bold"
                >×</button>
              </span>
            );
          })
        )}
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-grey-border rounded-lg shadow-xl max-h-64 overflow-y-auto overflow-x-hidden">
          <div className="sticky top-0 bg-white p-2 border-b border-grey-border z-10">
            <input 
              type="text" 
              placeholder="Buscar color o código..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border border-grey-border rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <div className="p-1">
            {filteredThreads.length === 0 ? (
              <p className="text-[10px] text-grey text-center py-4">No se encontraron colores</p>
            ) : (
              filteredThreads.map(thread => {
                const threadString = `${thread.code} (${thread.name})`;
                const isSelected = selectedThreads.includes(threadString);
                return (
                  <button
                    key={thread.code}
                    onClick={(e) => { e.stopPropagation(); toggleThread(thread); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] flex items-center gap-2.5 transition-colors ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-grey-light text-dark'}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shadow-inner flex-shrink-0 border border-dark/20" style={{ backgroundColor: thread.hex }} />
                    <span className="font-mono text-grey">{thread.code}</span>
                    <span className="flex-1 truncate">{thread.name}</span>
                    {isSelected && <span className="text-primary text-[14px]">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadSelect;
