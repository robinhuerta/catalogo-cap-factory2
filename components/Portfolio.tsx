import React, { useState } from 'react';
import { GLOBAL_CONFIG } from '../constants';

interface ProjectDisplay {
  id: string;
  cliente: string;
  imagen: string;
  industria: string;
  tecnica: string;
  cantidad: number;
  detalles: string;
  frase?: string;
}

const INDUSTRIES = ['Todos', 'Restaurantes', 'Deportes', 'Corporativo', 'Eventos', 'Retail'] as const;

interface Props {
  projects: ProjectDisplay[];
  onHome: () => void;
}

const Portfolio: React.FC<Props> = ({ projects, onHome }) => {
  const [active, setActive] = useState<string>('Todos');

  const filtered = active === 'Todos'
    ? projects
    : projects.filter(p => p.industria === active);

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-8 pb-24">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-grey mb-8">
        <button onClick={onHome} className="hover:text-dark transition-colors">Inicio</button>
        <span>/</span>
        <span className="text-dark">Proyectos</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-[9px] font-medium text-primary tracking-[0.5em] uppercase block mb-3">Casos reales</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-dark leading-[0.9] uppercase tracking-tight">
            Proyectos
          </h2>
        </div>
        <p className="text-grey text-sm max-w-xs leading-relaxed">
          Cada proyecto es una historia de marca. Aquí algunos de los trabajos que más nos enorgullecen.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-grey-border">
        {INDUSTRIES.map(ind => (
          <button
            key={ind}
            onClick={() => setActive(ind)}
            className={`px-5 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase transition-all border ${
              active === ind
                ? 'bg-dark text-cream border-dark'
                : 'bg-white text-grey border-grey-border hover:border-dark hover:text-dark'
            }`}
          >
            {ind}
            {ind !== 'Todos' && (
              <span className={`ml-1.5 text-[9px] ${active === ind ? 'text-cream/50' : 'text-grey/50'}`}>
                {projects.filter(p => p.industria === ind).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center">
          <p className="font-display text-xl font-bold text-dark mb-2">Sin proyectos en esta categoría</p>
          <p className="text-grey text-sm">Próximamente agregaremos más casos.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-20 bg-dark rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="font-display text-2xl font-bold text-cream mb-2">¿Tu marca podría estar aquí?</h3>
          <p className="text-cream/50 text-sm max-w-sm">Cuéntanos tu proyecto y lo hacemos realidad.</p>
        </div>
        <a
          href={`https://wa.me/${GLOBAL_CONFIG.WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20cotizar%20un%20proyecto%20personalizado.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2.5 px-8 py-3.5 bg-primary text-cream text-[11px] font-medium tracking-widest uppercase rounded-full hover:bg-white hover:text-dark transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z" />
          </svg>
          Iniciar mi proyecto
        </a>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: ProjectDisplay }> = ({ project }) => (
  <div className="group bg-white border border-grey-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
    <div className="aspect-[4/3] overflow-hidden bg-grey-light relative">
      <img
        src={project.imagen}
        alt={project.cliente}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
      />
      <div className="absolute top-3 left-3">
        <span className="bg-white/90 backdrop-blur-sm text-[9px] font-bold text-dark uppercase tracking-widest px-2.5 py-1 rounded-full">
          {project.industria}
        </span>
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="font-display text-lg font-bold text-dark">{project.cliente}</h3>
      <p className="text-grey text-sm mt-1 leading-relaxed flex-1">{project.detalles}</p>

      <div className="mt-4 pt-4 border-t border-grey-border grid grid-cols-2 gap-3">
        <div>
          <p className="text-[8px] text-grey uppercase tracking-widest font-medium mb-0.5">Técnica</p>
          <p className="text-[11px] font-semibold text-dark leading-snug">{project.tecnica}</p>
        </div>
        <div>
          <p className="text-[8px] text-grey uppercase tracking-widest font-medium mb-0.5">Cantidad</p>
          <p className="text-[11px] font-semibold text-dark">{project.cantidad.toLocaleString('es-PE')} uds</p>
        </div>
      </div>

      {project.frase && (
        <div className="mt-4 bg-cream rounded-xl px-4 py-3 flex gap-2.5">
          <svg className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <p className="text-[11px] text-grey italic leading-relaxed">{project.frase}</p>
        </div>
      )}
    </div>
  </div>
);

export default Portfolio;
