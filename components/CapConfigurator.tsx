import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ── Colores disponibles para la gorra ──────────────────────
const CAP_COLORS = [
  { name: 'Negro',       hex: '#1a1a1a' },
  { name: 'Blanco',      hex: '#f5f5f0' },
  { name: 'Rojo',        hex: '#c0392b' },
  { name: 'Azul Navy',   hex: '#1a2744' },
  { name: 'Verde',       hex: '#1e6b3c' },
  { name: 'Gris',        hex: '#6b7280' },
  { name: 'Amarillo',    hex: '#f59e0b' },
  { name: 'Celeste',     hex: '#3b82f6' },
  { name: 'Bordo',       hex: '#7b1c2e' },
  { name: 'Naranja',     hex: '#ea580c' },
  { name: 'Rosado',      hex: '#ec4899' },
  { name: 'Beige',       hex: '#d4b896' },
];

const EMBROIDERY_COLORS = [
  { name: 'Blanco',   hex: '#ffffff' },
  { name: 'Negro',    hex: '#1a1a1a' },
  { name: 'Dorado',   hex: '#d4a017' },
  { name: 'Plateado', hex: '#a8a9ad' },
  { name: 'Rojo',     hex: '#c0392b' },
  { name: 'Azul',     hex: '#1a2744' },
  { name: 'Amarillo', hex: '#f59e0b' },
  { name: 'Verde',    hex: '#1e6b3c' },
];

// ── Modelo 3D de gorra construido con geometrías básicas ───
const CapModel: React.FC<{
  capColor: string;
  embroideryColor: string;
  logoTexture: THREE.Texture | null;
}> = ({ capColor, embroideryColor, logoTexture }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const capMat = new THREE.MeshStandardMaterial({
    color: capColor,
    roughness: 0.8,
    metalness: 0.0,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: capColor,
    roughness: 0.6,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const logoMat = new THREE.MeshStandardMaterial({
    color: embroideryColor,
    roughness: 0.4,
    metalness: 0.1,
    map: logoTexture || null,
    transparent: !!logoTexture,
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>

      {/* Copa principal — semiesfera */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={capColor} roughness={0.8} />
      </mesh>

      {/* Base de la copa — cilindro */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 0.15, 32]} />
        <meshStandardMaterial color={capColor} roughness={0.8} />
      </mesh>

      {/* Visera */}
      <mesh position={[0, -0.18, 0.6]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.06, 1.0]} />
        <primitive object={visorMat} />
      </mesh>

      {/* Curva de la visera */}
      <mesh position={[0, -0.22, 1.0]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.06, 0.4]} />
        <primitive object={visorMat} />
      </mesh>

      {/* Panel frontal con logo */}
      <mesh position={[0, 0.15, 0.95]} castShadow>
        <planeGeometry args={[0.9, 0.7]} />
        <primitive object={logoMat} />
      </mesh>

      {/* Botón superior */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={embroideryColor} roughness={0.4} />
      </mesh>

      {/* Sudadera trasera */}
      <mesh position={[0, -0.05, -0.95]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#888" roughness={0.9} />
      </mesh>

    </group>
  );
};

// ── Componente principal ───────────────────────────────────
const CapConfigurator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [capColor, setCapColor] = useState('#1a1a1a');
  const [embroideryColor, setEmbroideryColor] = useState('#ffffff');
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [capColorName, setCapColorName] = useState('Negro');
  const [embColorName, setEmbColorName] = useState('Blanco');
  const [isSpinning, setIsSpinning] = useState(true);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setLogoTexture(tex);
    });
  }, []);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hola Cap Factory! Me interesa una gorra con estas características:\n\n` +
      `🎨 Color de gorra: ${capColorName}\n` +
      `🧵 Color de bordado: ${embColorName}\n` +
      `${logoPreview ? '✅ Logo: adjunto en imagen\n' : ''}` +
      `\n¿Me pueden cotizar?`
    );
    window.open(`https://wa.me/51999999999?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-grey mb-6">
          <button onClick={onBack} className="hover:text-dark transition-colors">Inicio</button>
          <span>/</span>
          <span className="text-dark">Configurador 3D</span>
        </nav>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-dark leading-[0.9] uppercase mb-2">
          Diseña tu <span className="text-primary">gorra.</span>
        </h1>
        <p className="text-grey text-sm">Elige colores, sube tu logo y míralo en 3D antes de pedir.</p>
      </div>

      {/* Main grid */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pb-24 grid lg:grid-cols-2 gap-10 items-start">

        {/* 3D Canvas */}
        <div className="relative bg-white border border-grey-border rounded-2xl overflow-hidden" style={{ height: 480 }}>
          <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }} shadows>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.4} />
            <CapModel
              capColor={capColor}
              embroideryColor={embroideryColor}
              logoTexture={logoTexture}
            />
            <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={5} blur={2} />
            <Environment preset="studio" />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={2.5}
              maxDistance={6}
              autoRotate={isSpinning}
              autoRotateSpeed={2}
            />
          </Canvas>
          {/* Hint */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <span className="text-[9px] text-grey bg-white/80 px-3 py-1 rounded-full border border-grey-border">
              Arrastra para girar · Scroll para zoom
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-8">

          {/* Color de gorra */}
          <div>
            <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">
              Color de gorra — <span className="text-dark">{capColorName}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {CAP_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => { setCapColor(c.hex); setCapColorName(c.name); }}
                  title={c.name}
                  className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${capColor === c.hex ? 'border-dark scale-110 shadow-md' : 'border-grey-border'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Color de bordado */}
          <div>
            <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">
              Color de bordado — <span className="text-dark">{embColorName}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {EMBROIDERY_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => { setEmbroideryColor(c.hex); setEmbColorName(c.name); }}
                  title={c.name}
                  className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${embroideryColor === c.hex ? 'border-dark scale-110 shadow-md' : 'border-grey-border'}`}
                  style={{ backgroundColor: c.hex, outline: c.hex === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                />
              ))}
            </div>
          </div>

          {/* Subir logo */}
          <div>
            <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-3">Tu logo</p>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-grey-border group-hover:border-primary transition-colors flex items-center justify-center overflow-hidden bg-grey-light">
                {logoPreview ? (
                  <img src={logoPreview} className="w-full h-full object-contain p-1" alt="Logo" />
                ) : (
                  <svg className="w-6 h-6 text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-dark group-hover:text-primary transition-colors">
                  {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                </p>
                <p className="text-[10px] text-grey">PNG o JPG con fondo transparente</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>

          {/* Resumen */}
          <div className="bg-white border border-grey-border rounded-xl p-5">
            <p className="text-[9px] font-medium text-grey tracking-[0.4em] uppercase mb-4">Tu configuración</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-grey">Color de gorra</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-grey-border" style={{ backgroundColor: capColor }} />
                  <span className="text-[11px] font-medium text-dark">{capColorName}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-grey">Color de bordado</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-grey-border" style={{ backgroundColor: embroideryColor }} />
                  <span className="text-[11px] font-medium text-dark">{embColorName}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-grey">Logo</span>
                <span className="text-[11px] font-medium text-dark">{logoPreview ? '✓ Subido' : 'Sin logo'}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-4 bg-dark text-cream text-[11px] font-medium tracking-widest uppercase rounded-full hover:bg-primary transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.512-5.741-1.488l-6.252 1.639zm6.059-4.145c1.616.96 3.104 1.458 4.717 1.458 5.464 0 9.909-4.444 9.909-9.909 0-2.639-1.027-5.122-2.892-6.988-1.866-1.865-4.35-2.891-6.99-2.891-5.465 0-9.91 4.444-9.91 9.91 0 1.884.526 3.633 1.523 5.17l-1.006 3.674 3.753-.984zm11.238-6.19c-.31-.156-1.833-.905-2.112-1.006-.28-.101-.484-.151-.688.156-.204.307-.79.99-.968 1.2-.178.209-.356.234-.666.078-.31-.156-1.31-.483-2.494-1.54-.922-.823-1.543-1.838-1.724-2.148-.18-.31-.02-.477.135-.632.14-.139.31-.36.466-.541.156-.181.208-.307.312-.512.103-.205.052-.385-.026-.541-.078-.156-.688-1.657-.942-2.268-.247-.597-.498-.517-.688-.527-.179-.009-.384-.01-.589-.01s-.54.077-.821.385c-.282.308-1.077 1.05-1.077 2.564s1.103 2.974 1.256 3.179c.153.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.65.738.234 1.41.201 1.94.122.592-.088 1.833-.75 2.09-1.474.256-.724.256-1.344.179-1.474-.076-.131-.282-.209-.592-.366z"/>
            </svg>
            Pedir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapConfigurator;
