"""
crear_gorra.py — Crea modelo 3D de gorra en Blender y renderiza en múltiples colores
Ejecutar desde Blender: blender --background --python crear_gorra.py
"""

import bpy
import math
import os

# ── Colores a renderizar ──────────────────────────────────
COLORES = [
    ("negro",     (0.02, 0.02, 0.02, 1)),
    ("blanco",    (0.95, 0.95, 0.92, 1)),
    ("rojo",      (0.63, 0.13, 0.13, 1)),
    ("azul-navy", (0.07, 0.12, 0.22, 1)),
    ("verde",     (0.07, 0.32, 0.18, 1)),
    ("gris",      (0.35, 0.38, 0.40, 1)),
    ("amarillo",  (0.90, 0.58, 0.04, 1)),
    ("celeste",   (0.16, 0.44, 0.90, 1)),
    ("bordo",     (0.38, 0.08, 0.15, 1)),
    ("naranja",   (0.82, 0.28, 0.03, 1)),
    ("rosado",    (0.85, 0.22, 0.55, 1)),
    ("beige",     (0.75, 0.65, 0.52, 1)),
    ("morado",    (0.40, 0.15, 0.82, 1)),
    ("terracota", (0.68, 0.30, 0.18, 1)),
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "gorras")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Limpiar escena ────────────────────────────────────────
def limpiar():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)

# ── Crear material de tela ────────────────────────────────
def crear_material(nombre, color_rgba, rugosidad=0.85):
    mat = bpy.data.materials.new(name=nombre)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color_rgba
    bsdf.inputs["Roughness"].default_value = rugosidad
    bsdf.inputs["Specular IOR Level"].default_value = 0.1
    return mat

# ── Construir gorra ───────────────────────────────────────
def construir_gorra(color_rgba):
    objetos = []

    # 1. Copa principal — semiesfera aplanada
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.0, segments=64, ring_count=32,
        location=(0, 0, 0.15)
    )
    copa = bpy.context.active_object
    copa.name = "Copa"
    copa.scale = (1.0, 0.92, 0.72)
    bpy.ops.object.transform_apply(scale=True)

    # Cortar la mitad inferior
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')
    import bmesh
    bm = bmesh.from_edit_mesh(copa.data)
    for v in bm.verts:
        if v.co.z < -0.05:
            v.select = True
    bpy.ops.mesh.delete(type='VERT')
    bpy.ops.object.mode_set(mode='OBJECT')
    objetos.append(copa)

    # 2. Banda inferior
    bpy.ops.mesh.primitive_cylinder_add(
        radius=1.0, depth=0.12,
        location=(0, 0, -0.06)
    )
    banda = bpy.context.active_object
    banda.name = "Banda"
    banda.scale = (1.0, 0.92, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    objetos.append(banda)

    # 3. Visera principal
    bpy.ops.mesh.primitive_cylinder_add(
        radius=1.3, depth=0.06,
        location=(0.35, 0.72, -0.14)
    )
    visera = bpy.context.active_object
    visera.name = "Visera"
    visera.scale = (0.85, 0.55, 1.0)
    visera.rotation_euler = (math.radians(-12), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    objetos.append(visera)

    # 4. Botón superior
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.07, location=(0, 0, 0.73)
    )
    boton = bpy.context.active_object
    boton.name = "Boton"
    objetos.append(boton)

    # 5. Líneas de costura (cilindros finos)
    for angulo in [0, 60, 120, 180, 240, 300]:
        rad = math.radians(angulo)
        x = math.sin(rad) * 0.5
        y = math.cos(rad) * 0.46
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.015, depth=0.85,
            location=(x, y, 0.25)
        )
        costura = bpy.context.active_object
        costura.name = f"Costura_{angulo}"
        costura.rotation_euler = (
            math.radians(-15) * math.cos(rad),
            math.radians(-15) * math.sin(rad),
            rad
        )
        bpy.ops.object.transform_apply(rotation=True)
        objetos.append(costura)

    # Asignar material a todos
    mat_tela = crear_material("Tela", color_rgba)
    for obj in objetos:
        obj.data.materials.clear()
        obj.data.materials.append(mat_tela)

    # Unir todos en uno
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objetos:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objetos[0]
    bpy.ops.object.join()

    return bpy.context.active_object

# ── Configurar cámara y luces ─────────────────────────────
def configurar_escena():
    # Cámara
    bpy.ops.object.camera_add(location=(2.8, -2.2, 1.8))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(62), 0, math.radians(52))
    bpy.context.scene.camera = cam

    # Luz principal
    bpy.ops.object.light_add(type='AREA', location=(3, -2, 4))
    luz1 = bpy.context.active_object
    luz1.data.energy = 800
    luz1.data.size = 3

    # Luz de relleno
    bpy.ops.object.light_add(type='AREA', location=(-3, 2, 2))
    luz2 = bpy.context.active_object
    luz2.data.energy = 200
    luz2.data.size = 4

    # Luz trasera
    bpy.ops.object.light_add(type='AREA', location=(0, 3, 3))
    luz3 = bpy.context.active_object
    luz3.data.energy = 150
    luz3.data.size = 2

    # Render settings
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 128
    scene.render.resolution_x = 800
    scene.render.resolution_y = 700
    scene.render.film_transparent = True  # fondo transparente
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

# ── Renderizar todos los colores ──────────────────────────
def renderizar_todos():
    configurar_escena()

    for nombre, color in COLORES:
        print(f"\n=== Renderizando: {nombre} ===")
        limpiar_gorras()

        gorra = construir_gorra(color)
        ruta = os.path.join(OUTPUT_DIR, f"gorra-{nombre}.png")
        bpy.context.scene.render.filepath = ruta
        bpy.ops.render.render(write_still=True)
        print(f"✓ Guardado: {ruta}")

    print("\n✅ Todas las gorras renderizadas.")

def limpiar_gorras():
    for obj in bpy.data.objects:
        if obj.name not in ["Camera", "Area", "Area.001", "Area.002"]:
            bpy.data.objects.remove(obj, do_unlink=True)

# ── Ejecutar ──────────────────────────────────────────────
if __name__ == "__main__" or True:
    limpiar()
    renderizar_todos()
