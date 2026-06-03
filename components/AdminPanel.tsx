import React, { useState, useEffect, useRef } from 'react';
import { supabase, DBProduct } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'capfactory2025';
const BUCKET = 'product-images';

const CATEGORIES = [
  'Snapback (Plana)',
  'Trucker (Malla)',
  'Daddy (Curva)',
  '5 Paneles',
  'Deportivas',
  'Publicitarias',
];

const EMPTY: Omit<DBProduct, 'id' | 'created_at'> = {
  nombre: '',
  categoria: CATEGORIES[0],
  imagen: '',
  descripcion: '',
  moq: 50,
  entrega: '15-20 días',
  precio: '',
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
  const lastForm = useRef<Omit<DBProduct, 'id' | 'created_at'>>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (auth) load(); }, [auth]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('orden').order('created_at');
    if (data) setProducts(data as DBProduct[]);
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
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(filename, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      setForm(f => ({ ...f, imagen: data.publicUrl }));
    }
    setUploading(false);
  };

  const handleBulkUpload = async (files: FileList) => {
    const total = files.length;
    setBulkProgress({ done: 0, total });
    for (let i = 0; i < total; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(filename, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        await supabase.from('products').insert([{
          ...EMPTY,
          nombre: `${bulkCategory} — modelo ${i + 1}`,
          categoria: bulkCategory,
          imagen: data.publicUrl,
          activo: false,
          orden: i,
        }]);
      }
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
      await supabase.from('products').update(payload).eq('id', editId);
    } else {
      await supabase.from('products').insert([payload]);
    }
    lastForm.current = payload;
    await load();
    setModal(false);
    setSaving(false);
  };

  const toggleActive = async (p: DBProduct) => {
    await supabase.from('products').update({ activo: !p.activo }).eq('id', p.id);
    await load();
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-cream text-xs">CF</span>
          </div>
          <div>
            <span className="font-display font-bold text-cream text-sm">Admin</span>
            <span className="text-grey text-[10px] ml-2 tracking-widest uppercase">{products.length} productos</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBulkModal(true)}
            disabled={!!bulkProgress}
            className="bg-white/10 text-cream px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/20"
          >
            {bulkProgress ? `Subiendo ${bulkProgress.done}/${bulkProgress.total}...` : '↑ Subida masiva'}
          </button>
          <input
            ref={bulkRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) { handleBulkUpload(e.target.files); setBulkModal(false); } }}
          />
          <button onClick={openAdd} className="bg-primary text-cream px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-primary-dark transition-colors">
            + Nuevo producto
          </button>
          <button onClick={onExit} className="text-grey hover:text-cream text-[11px] transition-colors px-3 py-2">
            Ver catálogo
          </button>
          <button onClick={() => setAuth(false)} className="text-grey hover:text-red-400 text-[11px] transition-colors px-3 py-2">
            Salir
          </button>
        </div>
      </div>

      {/* Product list */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-grey">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl font-bold text-dark mb-2">Sin productos aún</p>
            <p className="text-grey text-sm mb-6">Agrega tu primer producto con el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
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
                <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-2">Foto del producto</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-grey-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors flex items-center gap-4"
                >
                  {form.imagen ? (
                    <img src={form.imagen} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-grey-light rounded-lg flex items-center justify-center text-grey flex-shrink-0">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-dark">{uploading ? 'Subiendo...' : 'Click para subir foto'}</p>
                    <p className="text-grey text-xs mt-0.5">JPG, PNG o WEBP · Máx 5MB</p>
                    {form.imagen && (
                      <button
                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, imagen: '' })); }}
                        className="text-[10px] text-red-400 hover:text-red-600 mt-1 transition-colors"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                {/* Or paste URL */}
                <input
                  type="text"
                  placeholder="O pega una URL de imagen..."
                  value={form.imagen}
                  onChange={e => field('imagen', e.target.value)}
                  className="mt-2 w-full border border-grey-border rounded-lg px-3 py-2 text-xs text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors"
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
                  <label className="text-[10px] text-grey font-medium uppercase tracking-widest block mb-1.5">Precio</label>
                  <input type="text" placeholder="Desde S/ 25.00" value={form.precio} onChange={e => field('precio', e.target.value)}
                    className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-grey focus:outline-none focus:border-primary transition-colors" />
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
