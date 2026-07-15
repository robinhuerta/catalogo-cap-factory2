import React, { useState, useEffect, useRef } from 'react';
import { api, DBProduct, DBProject, DBPedido, PedidoItem } from '../lib/api';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'capfactory2025';

const CATEGORIES = [
  'Snapback (Plana)',
  'Trucker (Malla)',
  'Daddy (Curva)',
  '5 Paneles',
  'Deportivas',
  'Publicitarias',
];

const INDUSTRIES = ['Restaurantes', 'Deportes', 'Corporativo', 'Eventos', 'Retail'];

const EMPTY_PROJECT: Omit<DBProject, 'id' | 'created_at'> = {
  cliente: '', imagen: '', industria: 'Corporativo',
  tecnica: '', cantidad: 100, detalles: '', frase: '',
  activo: true, orden: 0,
};

const ESTADOS_PEDIDO = ['nuevo', 'produccion', 'listo', 'entregado', 'cancelado'] as const;
const ESTADO_LABELS: Record<string, string> = {
  nuevo: 'Nuevo', produccion: 'En producción', listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado',
};
const ESTADO_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-50 text-blue-600',
  produccion: 'bg-amber-50 text-amber-600',
  listo: 'bg-green-50 text-green-600',
  entregado: 'bg-grey-light text-grey',
  cancelado: 'bg-red-50 text-red-500',
};

const EMPTY_ITEM: PedidoItem = {
  diseno: '', color: '', tela: '', cantidad: 50, tecnica: '', imagen: '', notas: '', lote: '',
  corte: false, confeccion: false, bordado: false,
};

const SIN_LOTE = 'Sin agrupar';

const ETAPAS = [
  { key: 'corte' as const, label: 'Corte' },
  { key: 'confeccion' as const, label: 'Confección' },
  { key: 'bordado' as const, label: 'Bordado' },
];

const EMPTY_PEDIDO: Omit<DBPedido, 'id' | 'created_at'> = {
  cliente: '', telefono: '',
  fecha_pedido: new Date().toISOString().slice(0, 10),
  fecha_entrega: '', estado: 'nuevo', notas: '',
  items: [{ ...EMPTY_ITEM }],
  activo: true, orden: 0,
};

const EMPTY: Omit<DBProduct, 'id' | 'created_at'> = {
  nombre: '',
  categoria: CATEGORIES[0],
  imagen: '',
  imagenes: [],
  descripcion: '',
  moq: 50,
  entrega: '15-20 días',
  precio: '',
  precio_antes: '',
  tags: [],
  tela: '',
  bordado: '',
  visera: '',
  broche: '',
  acabados: '',
  activo: true,
  orden: 0,
};

interface AdminPanelProps {
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<DBProduct, 'id' | 'created_at'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState(CATEGORIES[0]);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const lastForm = useRef<Omit<DBProduct, 'id' | 'created_at'>>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

  // ── Projects state ───────────────────────────────────
  const [adminTab, setAdminTab] = useState<'products' | 'projects' | 'pedidos'>('products');
  const [dbProjects, setDbProjects] = useState<DBProject[]>([]);
  const [projectModal, setProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<DBProject, 'id' | 'created_at'>>(EMPTY_PROJECT);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectUploading, setProjectUploading] = useState(false);
  const [projectDeleteId, setProjectDeleteId] = useState<string | null>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);

  // ── Pedidos state (privado) ──────────────────────────
  const [pedidos, setPedidos] = useState<DBPedido[]>([]);
  const [pedidoModal, setPedidoModal] = useState(false);
  const [pedidoForm, setPedidoForm] = useState<Omit<DBPedido, 'id' | 'created_at'>>(EMPTY_PEDIDO);
  const [pedidoEditId, setPedidoEditId] = useState<string | null>(null);
  const [pedidoSaving, setPedidoSaving] = useState(false);
  const [pedidoDeleteId, setPedidoDeleteId] = useState<string | null>(null);
  const [itemUploadingIdx, setItemUploadingIdx] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [pedidoBulkProgress, setPedidoBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [pedidoViewId, setPedidoViewId] = useState<string | null>(null);
  const [pedidoPrintId, setPedidoPrintId] = useState<string | null>(null);
  const itemFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const pedidoBulkRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (auth) { load(); loadProjects(); loadPedidos(); } }, [auth]);

  const loadPedidos = async () => {
    const data = await api.list('pedidos', true, pw);
    setPedidos(data as DBPedido[]);
  };

  const openAddPedido = () => {
    setPedidoForm({ ...EMPTY_PEDIDO, fecha_pedido: new Date().toISOString().slice(0, 10), items: [{ ...EMPTY_ITEM }] });
    setPedidoEditId(null);
    setPedidoModal(true);
  };

  const openEditPedido = (p: DBPedido) => {
    const { id, created_at, ...rest } = p;
    setPedidoForm({ ...rest, items: rest.items.length ? rest.items : [{ ...EMPTY_ITEM }] });
    setPedidoEditId(id);
    setPedidoModal(true);
  };

  const pdField = (key: keyof typeof pedidoForm, value: unknown) =>
    setPedidoForm(f => ({ ...f, [key]: value }));

  const setItem = (idx: number, key: keyof PedidoItem, value: string | number) =>
    setPedidoForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [key]: value } : it) }));

  const addItem = () => setPedidoForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));

  const removeItem = (idx: number) =>
    setPedidoForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const uploadItemImage = async (idx: number, file: File) => {
    setItemUploadingIdx(idx);
    try {
      const url = await api.upload(file, pw);
      setItem(idx, 'imagen', url);
    } catch {}
    setItemUploadingIdx(null);
  };

  const uploadItemsFromFolder = async (files: FileList) => {
    const total = files.length;
    setPedidoBulkProgress({ done: 0, total });
    const newItems: PedidoItem[] = [];
    for (let i = 0; i < total; i++) {
      try {
        const url = await api.upload(files[i], pw);
        newItems.push({ ...EMPTY_ITEM, diseno: files[i].name.replace(/\.[^/.]+$/, ''), imagen: url });
      } catch {}
      setPedidoBulkProgress({ done: i + 1, total });
    }
    setPedidoForm(f => {
      const base = f.items.length === 1 && !f.items[0].imagen && !f.items[0].diseno ? [] : f.items;
      return { ...f, items: [...base, ...newItems] };
    });
    setPedidoBulkProgress(null);
  };

  const savePedido = async () => {
    if (!pedidoForm.cliente.trim()) return;
    setPedidoSaving(true);
    if (pedidoEditId) {
      await api.update('pedidos', pedidoEditId, pedidoForm, pw);
    } else {
      await api.create('pedidos', pedidoForm, pw);
    }
    await loadPedidos();
    setPedidoModal(false);
    setPedidoSaving(false);
  };

  const archivePedido = async (p: DBPedido) => {
    await api.update('pedidos', p.id, { activo: !p.activo }, pw);
    await loadPedidos();
  };

  const deletePedido = async () => {
    if (!pedidoDeleteId) return;
    await api.remove('pedidos', pedidoDeleteId, pw);
    setPedidoDeleteId(null);
    await loadPedidos();
  };

  const totalUnidades = (p: DBPedido) => p.items.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0);

  const changeEstado = async (pedidoId: string, estado: DBPedido['estado']) => {
    setPedidos(ps => ps.map(p => p.id === pedidoId ? { ...p, estado } : p));
    await api.update('pedidos', pedidoId, { estado }, pw);
  };

  const toggleItemStage = async (pedidoId: string, itemIdx: number, stage: 'corte' | 'confeccion' | 'bordado') => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    const items = pedido.items.map((it, i) => i === itemIdx ? { ...it, [stage]: !it[stage] } : it);
    setPedidos(ps => ps.map(p => p.id === pedidoId ? { ...p, items } : p));
    await api.update('pedidos', pedidoId, { items }, pw);
  };

  const setViewItemLote = (pedidoId: string, itemIdx: number, lote: string) => {
    setPedidos(ps => ps.map(p => p.id === pedidoId
      ? { ...p, items: p.items.map((it, i) => i === itemIdx ? { ...it, lote } : it) }
      : p));
  };

  const commitViewItems = async (pedidoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    await api.update('pedidos', pedidoId, { items: pedido.items }, pw);
  };

  const toggleLoteStage = async (pedidoId: string, loteName: string, stage: 'corte' | 'confeccion' | 'bordado') => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    const inLote = pedido.items.filter(it => (it.lote || SIN_LOTE) === loteName);
    const allDone = inLote.every(it => it[stage]);
    const items = pedido.items.map(it => (it.lote || SIN_LOTE) === loteName ? { ...it, [stage]: !allDone } : it);
    setPedidos(ps => ps.map(p => p.id === pedidoId ? { ...p, items } : p));
    await api.update('pedidos', pedidoId, { items }, pw);
  };

  const groupByLote = (items: PedidoItem[]) => {
    const map = new Map<string, { item: PedidoItem; idx: number }[]>();
    items.forEach((item, idx) => {
      const key = item.lote || SIN_LOTE;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ item, idx });
    });
    return Array.from(map.entries());
  };

  const loadProjects = async () => {
    const data = await api.list('projects', true, pw);
    setDbProjects(data as DBProject[]);
  };

  const handleProjectImageUpload = async (file: File) => {
    setProjectUploading(true);
    try {
      const url = await api.upload(file, pw);
      setProjectForm(f => ({ ...f, imagen: url }));
    } catch {}
    setProjectUploading(false);
  };

  const openAddProject = () => {
    setProjectForm(EMPTY_PROJECT);
    setProjectEditId(null);
    setProjectModal(true);
  };

  const openEditProject = (p: DBProject) => {
    const { id, created_at, ...rest } = p;
    setProjectForm(rest);
    setProjectEditId(id);
    setProjectModal(true);
  };

  const saveProject = async () => {
    if (!projectForm.cliente.trim()) return;
    setProjectSaving(true);
    if (projectEditId) {
      await api.update('projects', projectEditId, projectForm, pw);
    } else {
      await api.create('projects', projectForm, pw);
    }
    await loadProjects();
    setProjectModal(false);
    setProjectSaving(false);
  };

  const toggleProjectActive = async (p: DBProject) => {
    await api.update('projects', p.id, { activo: !p.activo }, pw);
    await loadProjects();
  };

  const deleteProject = async () => {
    if (!projectDeleteId) return;
    await api.remove('projects', projectDeleteId, pw);
    setProjectDeleteId(null);
    await loadProjects();
  };

  const pfield = (key: keyof typeof projectForm, value: string | number | boolean) =>
    setProjectForm(f => ({ ...f, [key]: value }));

  const load = async () => {
    setLoading(true);
    const data = await api.list('products', true, pw);
    setProducts(data as DBProduct[]);
    setLoading(false);
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuth(true); }
    else { setPwError(true); setTimeout(() => setPwError(false), 1500); }
  };

  const openAdd = () => {
    setForm({
      ...lastForm.current,
      nombre: '',
      imagen: '',
      descripcion: '',
      activo: true,
    });
    setEditId(null);
    setTagsInput(lastForm.current.tags.join(', '));
    setModal(true);
  };

  const openEdit = (p: DBProduct) => {
    const { id, created_at, ...rest } = p;
    setForm(rest);
    setEditId(id);
    setTagsInput(p.tags.join(', '));
    setModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await api.upload(file, pw);
      setForm(f => {
        if (!f.imagen) return { ...f, imagen: url };
        return { ...f, imagenes: [...(f.imagenes || []), url] };
      });
    } catch {}
    setUploading(false);
  };

  const handleBulkUpload = async (files: FileList) => {
    const total = files.length;
    setBulkProgress({ done: 0, total });
    for (let i = 0; i < total; i++) {
      const file = files[i];
      try {
        const url = await api.upload(file, pw);
        await api.create('products', {
          ...EMPTY,
          nombre: `${bulkCategory} — modelo ${i + 1}`,
          categoria: bulkCategory,
          imagen: url,
          activo: false,
          orden: i,
        }, pw);
      } catch {}
      setBulkProgress({ done: i + 1, total });
    }
    await load();
    setBulkProgress(null);
  };

  const save = async () => {
    if (!form.nombre.trim() || !form.categoria) return;
    setSaving(true);
    const payload = { ...form, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) };
    if (editId) {
      await api.update('products', editId, payload, pw);
    } else {
      await api.create('products', payload, pw);
    }
    lastForm.current = payload;
    await load();
    setModal(false);
    setSaving(false);
  };

  const toggleActive = async (p: DBProduct) => {
    await api.update('products', p.id, { activo: !p.activo }, pw);
    await load();
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    await api.remove('products', deleteId, pw);
    setDeleteId(null);
    await load();
  };

  const field = (key: keyof typeof form, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));

  // ── Login screen ─────────────────────────────────────
  if (!auth) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="font-display font-bold text-cream text-lg">CF</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-cream">Panel Admin</h1>
            <p className="text-grey text-sm mt-1">Cap Factory Perú</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-cream placeholder:text-grey focus:outline-none focus:border-primary transition-colors ${pwError ? 'border-red-500' : 'border-white/10'}`}
              autoFocus
            />
            {pwError && <p className="text-red-400 text-xs text-center">Contraseña incorrecta</p>}
            <button type="submit" className="w-full bg-primary text-cream py-3 rounded-xl font-medium tracking-widest uppercase text-[11px] hover:bg-primary-dark transition-colors">
              Entrar
            </button>
            <button type="button" onClick={onExit} className="w-full text-grey text-[11px] hover:text-cream transition-colors py-2">
              Volver al catálogo
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main panel ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div className="bg-dark border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-cream text-xs">CF</span>
            </div>
            <span className="font-display font-bold text-cream text-sm">Admin</span>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
            <button
              onClick={() => setAdminTab('products')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase transition-colors ${adminTab === 'products' ? 'bg-white text-dark' : 'text-cream/60 hover:text-cream'}`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setAdminTab('projects')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase transition-colors ${adminTab === 'projects' ? 'bg-white text-dark' : 'text-cream/60 hover:text-cream'}`}
            >
              Proyectos
            </button>
            <button
              onClick={() => setAdminTab('pedidos')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase transition-colors ${adminTab === 'pedidos' ? 'bg-white text-dark' : 'text-cream/60 hover:text-cream'}`}
            >
              Pedidos 🔒
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {adminTab === 'products' ? (
            <>
              <button
                onClick={() => setBulkModal(true)}
                disabled={!!bulkProgress}
                className="bg-white/10 text-cream px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/20"
              >
                {bulkProgress ? `Subiendo ${bulkProgress.done}/${bulkProgress.total}...` : '↑ Subida masiva'}
              </button>
              <input ref={bulkRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => { if (e.target.files?.length) { handleBulkUpload(e.target.files); setBulkModal(false); } }} />
              <button onClick={openAdd} className="bg-primary text-cream px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary-dark transition-colors">
                + Nuevo producto
              </button>
            </>
          ) : adminTab === 'projects' ? (
            <button onClick={openAddProject} className="bg-primary text-cream px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary-dark transition-colors">
              + Nuevo proyecto
            </button>
          ) : (
            <button onClick={openAddPedido} className="bg-primary text-cream px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary-dark transition-colors">
              + Nuevo pedido
            </button>
          )}
          <button onClick={onExit} className="text-grey hover:text-cream text-[11px] transition-colors px-3 py-2">Ver catálogo</button>
          <button onClick={() => setAuth(false)} className="text-grey hover:text-red-400 text-[11px] transition-colors px-3 py-2">Salir</button>
        </div>
      </div>

      {/* ── Projects list ────────────────────────────────── */}
      {adminTab === 'projects' && (
        <div className="max-w-5xl mx-auto px-6 py-10">
          {dbProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl font-bold text-dark mb-2">Sin proyectos aún</p>
              <p className="text-grey text-sm mb-6">Agrega tu primer proyecto con el botón de arriba.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dbProjects.map(p => (
                <div key={p.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-all ${p.activo ? 'border-grey-border' : 'border-grey-border opacity-50'}`}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-grey-light flex-shrink-0 cursor-zoom-in" onClick={() => p.imagen && setZoomImg(p.imagen)}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.cliente} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-grey text-xs">Sin foto</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-dark text-sm">{p.cliente}</p>
                      <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{p.industria}</span>
                      {!p.activo && <span className="text-[9px] bg-grey-light text-grey px-2 py-0.5 rounded-full uppercase tracking-widest">Oculto</span>}
                    </div>
                    <p className="text-grey text-[11px] mt-0.5">{p.tecnica} · {p.cantidad.toLocaleString('es-PE')} uds</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleProjectActive(p)} title={p.activo ? 'Ocultar' : 'Mostrar'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.activo ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-grey-light text-grey hover:bg-grey-border'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.activo ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} />
                      </svg>
                    </button>
                    <button onClick={() => openEditProject(p)} className="w-8 h-8 rounded-lg bg-grey-light hover:bg-dark hover:text-cream flex items-center justify-center transition-colors text-dark">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setProjectDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-grey-light hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors text-grey">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pedidos list (privado) ──────────────────────── */}
      {adminTab === 'pedidos' && (
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-[11px] text-amber-700">
            🔒 Esta sección es privada — no aparece en el catálogo público. Úsala para trabajar los pedidos de clientes con sus fotos de referencia, tela y cantidades.
          </div>
          {pedidos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setFilterEstado('')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase border transition-all ${filterEstado === '' ? 'bg-dark border-dark text-cream' : 'bg-white border-grey-border text-grey hover:border-dark hover:text-dark'}`}
              >
                Todos
              </button>
              {ESTADOS_PEDIDO.map(e => (
                <button
                  key={e}
                  onClick={() => setFilterEstado(e === filterEstado ? '' : e)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase border transition-all ${filterEstado === e ? 'bg-dark border-dark text-cream' : 'bg-white border-grey-border text-grey hover:border-dark hover:text-dark'}`}
                >
                  {ESTADO_LABELS[e]}
                </button>
              ))}
            </div>
          )}
          {pedidos.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl font-bold text-dark mb-2">Sin pedidos aún</p>
              <p className="text-grey text-sm mb-6">Agrega tu primer pedido con el botón de arriba.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidos.filter(p => !filterEstado || p.estado === filterEstado).map(p => (
                <div key={p.id} className={`bg-white border rounded-xl p-4 transition-all ${p.activo ? 'border-grey-border' : 'border-grey-border opacity-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-bold text-dark text-sm">{p.cliente}</p>
                        <select
                          value={p.estado}
                          onChange={e => changeEstado(p.id, e.target.value as DBPedido['estado'])}
                          onClick={e => e.stopPropagation()}
                          className={`text-[9px] pl-2 pr-1.5 py-0.5 rounded-full uppercase tracking-widest border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${ESTADO_COLORS[p.estado]}`}
                        >
                          {ESTADOS_PEDIDO.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
                        </select>
                        {!p.activo && <span className="text-[9px] bg-grey-light text-grey px-2 py-0.5 rounded-full uppercase tracking-widest">Archivado</span>}
                      </div>
                      <p className="text-grey text-[11px] mt-0.5">
                        {p.items.length} diseño{p.items.length !== 1 ? 's' : ''} · {totalUnidades(p).toLocaleString('es-PE')} uds
                        {p.fecha_entrega && ` · Entrega: ${p.fecha_entrega}`}
                        {p.telefono && ` · ${p.telefono}`}
                      </p>
                      {p.items.length > 0 && (
                        <div className="flex items-center gap-3 mt-1.5">
                          {ETAPAS.map(et => {
                            const done = p.items.filter(it => it[et.key]).length;
                            return (
                              <span key={et.key} className="text-[9px] text-grey">
                                {et.label}: <span className={done === p.items.length ? 'text-green-600 font-medium' : 'text-dark font-medium'}>{done}/{p.items.length}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setPedidoViewId(p.id)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-medium uppercase tracking-widest transition-colors">
                        Ver diseños
                      </button>
                      <button onClick={() => setPedidoPrintId(p.id)} className="px-3 py-2 rounded-lg bg-dark/5 text-dark hover:bg-dark/10 text-[10px] font-medium uppercase tracking-widest transition-colors">
                        🖨️ Ficha
                      </button>
                      <button onClick={() => archivePedido(p)} title={p.activo ? 'Archivar' : 'Reactivar'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.activo ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-grey-light text-grey hover:bg-grey-border'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.activo ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} />
                        </svg>
                      </button>
                      <button onClick={() => openEditPedido(p)} className="w-8 h-8 rounded-lg bg-grey-light hover:bg-dark hover:text-cream flex items-center justify-center transition-colors text-dark">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setPedidoDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-grey-light hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors text-grey">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {p.items.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-grey-border">
                      {p.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-3 bg-grey-light rounded-lg pl-1.5 pr-4 py-1.5">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 cursor-zoom-in" onClick={() => it.imagen && setZoomImg(it.imagen)}>
                            {it.imagen
                              ? <img src={it.imagen} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-grey text-[9px]">—</div>}
                          </div>
                          <span className="text-sm text-dark flex-1 min-w-0 truncate">{it.diseno || 'Sin nombre'} {it.color && `· ${it.color}`} · {it.cantidad} uds{it.lote && ` · ${it.lote}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product list */}
      <div className="max-w-5xl mx-auto px-6 py-10" style={{ display: adminTab === 'products' ? undefined : 'none' }}>
        {/* Filters */}
        {!loading && products.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Category filter */}
            <button
              onClick={() => setFilterCat('')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase border transition-all ${filterCat === '' ? 'bg-dark border-dark text-cream' : 'bg-white border-grey-border text-grey hover:border-dark hover:text-dark'}`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat === filterCat ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase border transition-all ${filterCat === cat ? 'bg-dark border-dark text-cream' : 'bg-white border-grey-border text-grey hover:border-dark hover:text-dark'}`}
              >
                {cat}
              </button>
            ))}
            {/* Divider */}
            <div className="w-px h-5 bg-grey-border mx-1" />
            {/* Status filter */}
            {(['all', 'active', 'hidden'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase border transition-all ${filterStatus === s ? 'bg-primary border-primary text-cream' : 'bg-white border-grey-border text-grey hover:border-primary hover:text-primary'}`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Visibles' : 'Ocultos'}
              </button>
            ))}
            {/* Result count */}
            <span className="ml-auto text-[10px] text-grey">
              {products.filter(p =>
                (filterCat === '' || p.categoria === filterCat) &&
                (filterStatus === 'all' || (filterStatus === 'active' ? p.activo : !p.activo))
              ).length} de {products.length}
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-grey">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl font-bold text-dark mb-2">Sin productos aún</p>
            <p className="text-grey text-sm mb-6">Agrega tu primer producto con el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.filter(p =>
              (filterCat === '' || p.categoria === filterCat) &&
              (filterStatus === 'all' || (filterStatus === 'active' ? p.activo : !p.activo))
            ).map(p => (
              <div key={p.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-all ${p.activo ? 'border-grey-border' : 'border-grey-border opacity-50'}`}>
                {/* Image with zoom on click */}
                <div
                  className="w-16 h-16 rounded-lg overflow-hidden bg-grey-light flex-shrink-0 cursor-zoom-in relative"
                  onClick={e => { e.stopPropagation(); if (p.imagen) setZoomImg(p.imagen); }}
                >
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-grey text-xs">Sin foto</div>
                  }
                  {p.imagen && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-dark/20">
                      <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v4m-2-2h4" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-dark text-sm">{p.nombre}</p>
                    {!p.activo && <span className="text-[9px] bg-grey-light text-grey px-2 py-0.5 rounded-full uppercase tracking-widest">Oculto</span>}
                  </div>
                  <p className="text-grey text-[11px] mt-0.5">{p.categoria} · MOQ {p.moq} · {p.precio || 'Sin precio'}</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleActive(p)}
                    title={p.activo ? 'Ocultar' : 'Mostrar'}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.activo ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-grey-light text-grey hover:bg-grey-border'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.activo ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} />
                    </svg>
                  </button>
                  {/* Edit */}
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-grey-light hover:bg-dark hover:text-cream flex items-center justify-center transition-colors text-dark">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-grey-light hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors text-grey">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* ── Project Modal ───────────────────────────────── */}
      {projectModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setProjectModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl mb-10">
            <div className="p-6 border-b border-grey-border flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-dark">{projectEditId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
              <button onClick={() => setProjectModal(false)} className="w-8 h-8 rounded-full bg-grey-light hover:bg-grey-border flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Image */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-2">Foto del proyecto</label>
                <div className="flex items-center gap-3">
                  {projectForm.imagen ? (
                    <div className="relative group/thumb">
                      <img src={projectForm.imagen} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-primary" />
                      <button onClick={() => pfield('imagen', '')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">×</button>
                    </div>
                  ) : (
                    <div onClick={() => projectFileRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-grey-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-grey hover:text-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-[9px] mt-1">{projectUploading ? 'Subiendo...' : 'Foto'}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input ref={projectFileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleProjectImageUpload(e.target.files[0])} />
                    <input type="text" placeholder="O pega una URL..."
                      value="" onChange={e => { if (e.target.value) { pfield('imagen', e.target.value); e.target.value = ''; } }}
                      className="w-full border border-grey-border rounded-lg px-3 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Cliente + Industria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Cliente / Marca *</label>
                  <input type="text" placeholder="Ej: Ripley, Bembos..." value={projectForm.cliente}
                    onChange={e => pfield('cliente', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Industria</label>
                  <select value={projectForm.industria} onChange={e => pfield('industria', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors bg-white">
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {/* Técnica + Cantidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Técnica usada</label>
                  <input type="text" placeholder="Ej: Bordado 3D + etiqueta" value={projectForm.tecnica}
                    onChange={e => pfield('tecnica', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Cantidad (uds)</label>
                  <input type="number" value={projectForm.cantidad} onChange={e => pfield('cantidad', parseInt(e.target.value) || 0)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              {/* Detalles */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Descripción del proyecto</label>
                <textarea rows={2} placeholder="Qué se hizo, para qué fue..." value={projectForm.detalles}
                  onChange={e => pfield('detalles', e.target.value)}
                  className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>

              {/* Frase */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Frase del cliente <span className="text-grey/50">(opcional)</span></label>
                <input type="text" placeholder='Ej: "La calidad superó nuestras expectativas."' value={projectForm.frase}
                  onChange={e => pfield('frase', e.target.value)}
                  className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
              </div>

              {/* Orden + Visible */}
              <div className="flex items-center justify-between pt-2 border-t border-grey-border">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest">Orden</label>
                  <input type="number" value={projectForm.orden} onChange={e => pfield('orden', parseInt(e.target.value) || 0)}
                    className="w-16 border border-grey-border rounded-lg px-2 py-1.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors text-center" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[10px] text-grey font-medium uppercase tracking-widest">Visible</span>
                  <div onClick={() => pfield('activo', !projectForm.activo)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${projectForm.activo ? 'bg-primary' : 'bg-grey-border'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${projectForm.activo ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-grey-border flex gap-3 justify-end">
              <button onClick={() => setProjectModal(false)} className="px-6 py-2.5 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">
                Cancelar
              </button>
              <button onClick={saveProject} disabled={projectSaving || projectUploading || !projectForm.cliente.trim()}
                className="px-8 py-2.5 bg-dark text-cream rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {projectSaving ? 'Guardando...' : projectEditId ? 'Guardar cambios' : 'Crear proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project delete confirm */}
      {projectDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setProjectDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-dark mb-2">¿Eliminar proyecto?</h3>
            <p className="text-grey text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setProjectDeleteId(null)} className="flex-1 py-2.5 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">Cancelar</button>
              <button onClick={deleteProject} className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-red-600 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ──────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl mb-10">
            {/* Modal header */}
            <div className="p-6 border-b border-grey-border flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-dark">{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-full bg-grey-light hover:bg-grey-border flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Image upload */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-2">
                  Fotos del producto <span className="text-grey/60">(primera = portada)</span>
                </label>

                {/* Gallery thumbnails */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Main image */}
                  {form.imagen && (
                    <div className="relative group/thumb">
                      <img src={form.imagen} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-primary" />
                      <span className="absolute -top-1.5 -left-1.5 bg-primary text-cream text-[8px] font-bold px-1.5 py-0.5 rounded-full">Principal</span>
                      <button onClick={() => setForm(f => ({ ...f, imagen: '' }))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">×</button>
                    </div>
                  )}
                  {/* Extra images */}
                  {(form.imagenes || []).map((img, i) => (
                    <div key={i} className="relative group/thumb">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-grey-border" />
                      <button onClick={() => setForm(f => ({ ...f, imagenes: (f.imagenes || []).filter((_, j) => j !== i) }))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                  {/* Add photo button */}
                  <div onClick={() => fileRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-grey-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-grey hover:text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[9px] mt-1 font-medium">{uploading ? '...' : 'Añadir'}</span>
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                <input
                  type="text"
                  placeholder="O pega una URL de imagen..."
                  value=""
                  onChange={e => {
                    if (!e.target.value) return;
                    if (!form.imagen) { field('imagen', e.target.value); }
                    else { setForm(f => ({ ...f, imagenes: [...(f.imagenes || []), e.target.value] })); }
                    e.target.value = '';
                  }}
                  className="mt-1 w-full border border-grey-border rounded-lg px-3 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Ej: Pro-Snap Clásica"
                    value={form.nombre}
                    onChange={e => field('nombre', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={e => field('categoria', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Describe el modelo..."
                  value={form.descripcion}
                  onChange={e => field('descripcion', e.target.value)}
                  className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Price + MOQ + Delivery */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Precio actual</label>
                  <input type="text" placeholder="Desde S/ 25.00" value={form.precio} onChange={e => field('precio', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                  <input type="text" placeholder="Precio antes (opcional)" value={form.precio_antes} onChange={e => field('precio_antes', e.target.value)}
                    className="mt-1.5 w-full border border-grey-border rounded-lg px-3 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                  {form.precio_antes && <p className="text-[9px] text-primary mt-1">Antes: <s>{form.precio_antes}</s> → Ahora: {form.precio}</p>}
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">MOQ (mín. unid.)</label>
                  <input type="number" placeholder="50" value={form.moq} onChange={e => field('moq', parseInt(e.target.value) || 0)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Entrega</label>
                  <input type="text" placeholder="15-20 días" value={form.entrega} onChange={e => field('entrega', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Tags (separados por coma)</label>
                <input type="text" placeholder="Premium, Bordado 3D, Más Vendida" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                  className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
              </div>

              {/* Technical specs */}
              <div>
                <p className="text-[10px] text-grey font-medium uppercase tracking-widest mb-3">Ficha técnica</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'tela', label: 'Tela base' },
                    { key: 'bordado', label: 'Bordado / arte' },
                    { key: 'visera', label: 'Visera' },
                    { key: 'broche', label: 'Broche / ajuste' },
                    { key: 'acabados', label: 'Acabados especiales' },
                  ].map(({ key, label }) => (
                    <div key={key} className={key === 'acabados' ? 'col-span-2' : ''}>
                      <label className="text-[9px] text-grey font-medium uppercase tracking-widest block mb-1">{label}</label>
                      <input type="text" placeholder={label} value={(form as any)[key]} onChange={e => field(key as any, e.target.value)}
                        className="w-full border border-grey-border rounded-lg px-3 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Order + Active */}
              <div className="flex items-center justify-between pt-2 border-t border-grey-border">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest">Orden</label>
                  <input type="number" value={form.orden} onChange={e => field('orden', parseInt(e.target.value) || 0)}
                    className="w-16 border border-grey-border rounded-lg px-2 py-1.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors text-center" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[10px] text-grey font-medium uppercase tracking-widest">Visible en catálogo</span>
                  <div
                    onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.activo ? 'bg-primary' : 'bg-grey-border'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-grey-border flex gap-3 justify-end">
              <button onClick={() => setModal(false)} className="px-6 py-2.5 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || uploading || !form.nombre.trim()}
                className="px-8 py-2.5 bg-dark text-cream rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk category modal ────────────────────────── */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setBulkModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="font-display text-xl font-bold text-dark mb-2">Subida masiva</h2>
            <p className="text-grey text-sm mb-6">¿A qué categoría pertenecen estas fotos?</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setBulkCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[11px] font-medium tracking-wide uppercase border transition-all ${
                    bulkCategory === cat
                      ? 'bg-dark border-dark text-cream'
                      : 'bg-white border-grey-border text-grey hover:border-dark hover:text-dark'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="bg-grey-light rounded-xl p-4 mb-6 text-sm text-grey">
              <span className="font-semibold text-dark">Categoría seleccionada:</span> {bulkCategory}
              <br />
              <span className="text-xs">Las fotos se crearán como ocultas — las editas con nombre y precio después.</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBulkModal(false)} className="flex-1 py-3 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => bulkRef.current?.click()}
                className="flex-1 py-3 bg-dark text-cream rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary transition-colors"
              >
                Seleccionar fotos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pedido Modal ─────────────────────────────────── */}
      {pedidoModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setPedidoModal(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl mb-10">
            <div className="p-6 border-b border-grey-border flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-dark">{pedidoEditId ? 'Editar pedido' : 'Nuevo pedido'}</h2>
              <button onClick={() => setPedidoModal(false)} className="w-8 h-8 rounded-full bg-grey-light hover:bg-grey-border flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cliente + Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Cliente *</label>
                  <input type="text" placeholder="Nombre del cliente" value={pedidoForm.cliente}
                    onChange={e => pdField('cliente', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Teléfono / WhatsApp</label>
                  <input type="text" placeholder="+51 9..." value={pedidoForm.telefono}
                    onChange={e => pdField('telefono', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              {/* Fechas + Estado */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Fecha pedido</label>
                  <input type="date" value={pedidoForm.fecha_pedido} onChange={e => pdField('fecha_pedido', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Entrega estimada</label>
                  <input type="date" value={pedidoForm.fecha_entrega} onChange={e => pdField('fecha_entrega', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Estado</label>
                  <select value={pedidoForm.estado} onChange={e => pdField('estado', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors bg-white">
                    {ESTADOS_PEDIDO.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
                  </select>
                </div>
              </div>

              {/* Notas / resumen de WhatsApp */}
              <div>
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">
                  Notas <span className="text-grey/50">(pega aquí el chat exportado de WhatsApp)</span>
                </label>
                <textarea rows={4} placeholder="Detalles del pedido, condiciones, lo que escribió el cliente..." value={pedidoForm.notas}
                  onChange={e => pdField('notas', e.target.value)}
                  className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>

              {/* Items / diseños */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-grey font-medium uppercase tracking-widest">Diseños del pedido</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => pedidoBulkRef.current?.click()} disabled={!!pedidoBulkProgress}
                      className="text-[10px] text-primary font-medium uppercase tracking-widest hover:text-primary-dark transition-colors disabled:opacity-50">
                      {pedidoBulkProgress ? `Subiendo ${pedidoBulkProgress.done}/${pedidoBulkProgress.total}...` : '↑ Subir varias fotos'}
                    </button>
                    <input ref={pedidoBulkRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { if (e.target.files?.length) uploadItemsFromFolder(e.target.files); }} />
                    <button onClick={addItem} className="text-[10px] text-primary font-medium uppercase tracking-widest hover:text-primary-dark transition-colors">+ Agregar diseño</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {pedidoForm.items.map((it, idx) => (
                    <div key={idx} className="border border-grey-border rounded-xl p-4 relative">
                      {pedidoForm.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-grey-light hover:bg-red-500 hover:text-white flex items-center justify-center text-grey text-xs transition-colors">×</button>
                      )}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {it.imagen ? (
                            <div className="relative group/thumb">
                              <img src={it.imagen} alt="" onClick={() => setZoomImg(it.imagen)}
                                className="w-32 h-32 object-cover rounded-lg border border-grey-border cursor-zoom-in hover:opacity-90 transition-opacity" />
                              <button onClick={() => setItem(idx, 'imagen', '')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">×</button>
                            </div>
                          ) : (
                            <div onClick={() => itemFileRefs.current[idx]?.click()} className="w-32 h-32 border-2 border-dashed border-grey-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-grey hover:text-primary">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[9px] mt-1">{itemUploadingIdx === idx ? '...' : 'Foto ref.'}</span>
                            </div>
                          )}
                          <input ref={el => { itemFileRefs.current[idx] = el; }} type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && uploadItemImage(idx, e.target.files[0])} />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Diseño / modelo" value={it.diseno} onChange={e => setItem(idx, 'diseno', e.target.value)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                          <input type="text" placeholder="Color" value={it.color} onChange={e => setItem(idx, 'color', e.target.value)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                          <input type="text" placeholder="Tela a comprar" value={it.tela} onChange={e => setItem(idx, 'tela', e.target.value)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                          <input type="text" placeholder="Técnica (bordado, estampado...)" value={it.tecnica} onChange={e => setItem(idx, 'tecnica', e.target.value)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                          <input type="number" placeholder="Cantidad" value={it.cantidad} onChange={e => setItem(idx, 'cantidad', parseInt(e.target.value) || 0)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                          <input type="text" placeholder="Lote (ej. Orden 001)" value={it.lote} onChange={e => setItem(idx, 'lote', e.target.value)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
                          <input type="text" placeholder="Notas del diseño" value={it.notas} onChange={e => setItem(idx, 'notas', e.target.value)}
                            className="border border-grey-border rounded-lg px-2.5 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors col-span-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-grey-border flex gap-3 justify-end">
              <button onClick={() => setPedidoModal(false)} className="px-6 py-2.5 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">
                Cancelar
              </button>
              <button onClick={savePedido} disabled={pedidoSaving || !pedidoForm.cliente.trim()}
                className="px-8 py-2.5 bg-dark text-cream rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {pedidoSaving ? 'Guardando...' : pedidoEditId ? 'Guardar cambios' : 'Crear pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pedido delete confirm */}
      {pedidoDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setPedidoDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-dark mb-2">¿Eliminar pedido?</h3>
            <p className="text-grey text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setPedidoDeleteId(null)} className="flex-1 py-2.5 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">Cancelar</button>
              <button onClick={deletePedido} className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-red-600 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pedido catalog view (marcar etapas) ──────────── */}
      {pedidoViewId && (() => {
        const p = pedidos.find(x => x.id === pedidoViewId);
        if (!p) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setPedidoViewId(null)} />
            <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl mb-10">
              <div className="p-6 border-b border-grey-border flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                <div>
                  <h2 className="font-display text-xl font-bold text-dark">{p.cliente}</h2>
                  <p className="text-grey text-[11px] mt-0.5">{p.items.length} diseños · {totalUnidades(p).toLocaleString('es-PE')} uds</p>
                </div>
                <button onClick={() => setPedidoViewId(null)} className="w-8 h-8 rounded-full bg-grey-light hover:bg-grey-border flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                {groupByLote(p.items).map(([loteName, entries]) => {
                  const loteTotal = entries.reduce((s, { item }) => s + (Number(item.cantidad) || 0), 0);
                  return (
                    <div key={loteName} className="mb-8 last:mb-0">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-dark/10">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display font-bold text-dark text-sm">{loteName}</h3>
                          <span className="text-[10px] text-grey">{entries.length} diseños · {loteTotal.toLocaleString('es-PE')} uds</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {ETAPAS.map(et => {
                            const done = entries.filter(({ item }) => item[et.key]).length;
                            const allDone = done === entries.length;
                            return (
                              <button
                                key={et.key}
                                onClick={() => toggleLoteStage(p.id, loteName, et.key)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-medium uppercase tracking-widest transition-colors ${allDone ? 'bg-green-500 text-white' : 'bg-grey-light text-grey hover:bg-grey-border'}`}
                              >
                                {et.label} {done}/{entries.length}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {entries.map(({ item: it, idx: i }) => {
                          const doneCount = ETAPAS.filter(et => it[et.key]).length;
                          return (
                            <div key={i} className={`border rounded-xl overflow-hidden transition-all ${doneCount === ETAPAS.length ? 'border-green-300 bg-green-50/30' : 'border-grey-border'}`}>
                              <div className="w-full aspect-square bg-grey-light cursor-zoom-in" onClick={() => it.imagen && setZoomImg(it.imagen)}>
                                {it.imagen
                                  ? <img src={it.imagen} alt="" className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-grey text-xs">Sin foto</div>}
                              </div>
                              <div className="p-3">
                                <p className="font-medium text-dark text-xs truncate">{it.diseno || 'Sin nombre'}</p>
                                <p className="text-grey text-[10px] mt-0.5">
                                  {it.cantidad} uds{it.color && ` · ${it.color}`}{it.tela && ` · ${it.tela}`}
                                </p>
                                {it.notas && <p className="text-grey/70 text-[10px] mt-1 italic line-clamp-2">{it.notas}</p>}
                                <input
                                  type="text"
                                  placeholder="Lote (ej. Orden 001)"
                                  defaultValue={it.lote}
                                  onChange={e => setViewItemLote(p.id, i, e.target.value)}
                                  onBlur={() => commitViewItems(p.id)}
                                  className="mt-2 w-full border border-grey-border rounded-lg px-2 py-1 text-[10px] text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors"
                                />
                                <div className="flex flex-col gap-1 mt-2">
                                  {ETAPAS.map(et => (
                                    <button
                                      key={et.key}
                                      onClick={() => toggleItemStage(p.id, i, et.key)}
                                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${it[et.key] ? 'bg-green-500 text-white' : 'bg-grey-light text-grey hover:bg-grey-border'}`}
                                    >
                                      <span className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${it[et.key] ? 'border-white bg-white/20' : 'border-grey'}`}>
                                        {it[et.key] && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                      </span>
                                      {et.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Ficha de producción (para imprimir / mandar al taller) ── */}
      {pedidoPrintId && (() => {
        const p = pedidos.find(x => x.id === pedidoPrintId);
        if (!p) return null;
        return (
          <div className="print-modal-wrapper fixed inset-0 z-[200] flex items-start justify-center p-4 pt-10 overflow-y-auto">
            <style>{`
              @media print {
                @page { size: A4; margin: 12mm; }
                body * { visibility: hidden; }
                .print-modal-wrapper { position: static !important; display: block !important; height: auto !important; overflow: visible !important; padding: 0 !important; }
                .print-sheet, .print-sheet * { visibility: visible; }
                .print-sheet {
                  position: static !important; width: 100% !important; max-width: none !important;
                  margin: 0 !important; box-shadow: none !important; border: none !important; border-radius: 0 !important;
                }
                .no-print { display: none !important; }
                .lote-block { break-inside: avoid; }
              }
            `}</style>
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm no-print" onClick={() => setPedidoPrintId(null)} />
            <div className="print-sheet relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl mb-10">
              <div className="p-6 border-b border-grey-border flex items-center justify-between no-print sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="font-display text-lg font-bold text-dark">Ficha de producción</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-cream rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary-dark transition-colors">
                    🖨️ Imprimir / Guardar PDF
                  </button>
                  <button onClick={() => setPedidoPrintId(null)} className="w-8 h-8 rounded-full bg-grey-light hover:bg-grey-border flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-8 print:p-0">
                <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-dark">
                  <div>
                    <p className="text-[9px] text-grey uppercase tracking-widest">Cap Factory Perú</p>
                    <h1 className="font-display text-2xl font-bold text-dark mt-0.5">{p.cliente}</h1>
                  </div>
                  <div className="text-right text-[11px] text-grey">
                    {p.fecha_pedido && <p>Pedido: {p.fecha_pedido}</p>}
                    {p.fecha_entrega && <p className="font-semibold text-dark">Entrega: {p.fecha_entrega}</p>}
                    {p.telefono && <p>{p.telefono}</p>}
                    <p className="mt-1">Total: <span className="font-semibold text-dark">{totalUnidades(p).toLocaleString('es-PE')} uds</span> · {p.items.length} diseños</p>
                  </div>
                </div>

                {groupByLote(p.items).map(([loteName, entries], loteIdx, allLotes) => {
                  const loteTotal = entries.reduce((s, { item }) => s + (Number(item.cantidad) || 0), 0);
                  const isLast = loteIdx === allLotes.length - 1;
                  return (
                    <div key={loteName} className="lote-block mb-6" style={isLast ? undefined : { breakAfter: 'page' }}>
                      <div className="flex items-baseline justify-between mb-2 bg-grey-light px-3 py-1.5 rounded-lg">
                        <h3 className="font-display font-bold text-dark text-sm">{loteName} <span className="text-grey font-normal text-[10px]">· {p.cliente}</span></h3>
                        <span className="text-[10px] text-grey">{entries.length} diseños · {loteTotal.toLocaleString('es-PE')} uds</span>
                      </div>
                      <table className="w-full text-[10px] border-collapse">
                        <thead>
                          <tr className="text-left text-grey border-b border-grey-border">
                            <th className="py-1.5 pr-2 font-medium w-12">Foto</th>
                            <th className="py-1.5 pr-2 font-medium">Diseño</th>
                            <th className="py-1.5 pr-2 font-medium">Color</th>
                            <th className="py-1.5 pr-2 font-medium">Tela</th>
                            <th className="py-1.5 pr-2 font-medium">Técnica</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Cant.</th>
                            <th className="py-1.5 font-medium">Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map(({ item: it }, i) => (
                            <tr key={i} className="border-b border-grey-border/60">
                              <td className="py-1.5 pr-2">
                                {it.imagen
                                  ? <img src={it.imagen} alt="" className="w-9 h-9 object-cover rounded" />
                                  : <div className="w-9 h-9 bg-grey-light rounded" />}
                              </td>
                              <td className="py-1.5 pr-2 text-dark">{it.diseno || '—'}</td>
                              <td className="py-1.5 pr-2 text-dark">{it.color || '—'}</td>
                              <td className="py-1.5 pr-2 text-dark">{it.tela || '—'}</td>
                              <td className="py-1.5 pr-2 text-dark">{it.tecnica || '—'}</td>
                              <td className="py-1.5 pr-2 text-dark text-right font-medium">{it.cantidad}</td>
                              <td className="py-1.5 text-grey italic">{it.notas}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}

                {p.notas && (
                  <div className="mt-6 pt-4 border-t border-grey-border">
                    <p className="text-[9px] text-grey uppercase tracking-widest mb-1">Notas generales del pedido</p>
                    <p className="text-[11px] text-dark whitespace-pre-wrap">{p.notas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Zoom image preview ─────────────────────────── */}
      {zoomImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setZoomImg(null)}>
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
          <img src={zoomImg} alt="" className="relative max-w-2xl w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          <button onClick={() => setZoomImg(null)} className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-dark mb-2">¿Eliminar producto?</h3>
            <p className="text-grey text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-grey-border rounded-full text-[11px] font-medium tracking-widest uppercase text-grey hover:border-dark hover:text-dark transition-colors">
                Cancelar
              </button>
              <button onClick={deleteProduct} className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-red-600 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
