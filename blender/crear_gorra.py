"""
crear_gorra.py v2 — Gorra realista con 6 paneles, visera curvada y costuras
Ejecutar: blender --background --python crear_gorra.py
"""

import bpy
import bmesh
import math
import os

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


def limpiar_objetos():
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)


def crear_material(nombre, color_rgba):
    mat = bpy.data.materials.new(name=nombre)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Limpiar nodos
    for n in nodes:
        nodes.remove(n)

    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (400, 0)

    # Principled BSDF
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs["Base Color"].default_value = color_rgba
    bsdf.inputs["Roughness"].default_value = 0.88
    bsdf.inputs["Specular IOR Level"].default_value = 0.08

    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def crear_gorra(color_rgba):
    objetos = []

    # ── 1. COPA — esfera achatada cortada por la mitad ──
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.0, segments=64, ring_count=48,
        location=(0, 0, 0)
    )
    copa = bpy.context.active_object
    copa.name = "Copa"
    copa.scale = (1.0, 0.88, 0.78)
    bpy.ops.object.transform_apply(scale=True)

    # Cortar parte inferior
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(copa.data)
    verts_borrar = [v for v in bm.verts if v.co.z < -0.02]
    bmesh.ops.delete(bm, geom=verts_borrar, context='VERTS')
    bmesh.update_edit_mesh(copa.data)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Suavizar
    bpy.ops.object.shade_smooth()
    objetos.append(copa)

    # ── 2. BANDA inferior ──
    bpy.ops.mesh.primitive_cylinder_add(
        radius=1.0, depth=0.10,
        location=(0, 0, -0.05),
        vertices=64
    )
    banda = bpy.context.active_object
    banda.name = "Banda"
    banda.scale = (1.0, 0.88, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    objetos.append(banda)

    # ── 3. VISERA — forma de pico curvado ──
    bpy.ops.mesh.primitive_circle_add(
        radius=1.0, fill_type='NGON',
        vertices=32, location=(0, 0, -0.09)
    )
    visera_base = bpy.context.active_object
    visera_base.name = "Visera"

    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(visera_base.data)

    # Mantener solo la mitad frontal y alargarla
    verts_borrar = [v for v in bm.verts if v.co.y < -0.05]
    bmesh.ops.delete(bm, geom=verts_borrar, context='VERTS')

    # Escalar hacia adelante
    for v in bm.verts:
        if v.co.y > 0:
            v.co.y *= 1.85
            v.co.x *= 1.35
            # Curvar hacia abajo en los bordes
            dist = abs(v.co.x)
            v.co.z -= (dist * 0.08)
            v.co.z -= (v.co.y * 0.06)

    bmesh.update_edit_mesh(visera_base.data)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Dar grosor a la visera
    bpy.ops.object.modifier_add(type='SOLIDIFY')
    visera_base.modifiers["Solidify"].thickness = 0.055
    visera_base.modifiers["Solidify"].offset = 0
    bpy.ops.object.modifier_apply(modifier="Solidify")
    bpy.ops.object.shade_smooth()
    objetos.append(visera_base)

    # ── 4. COSTURAS de los 6 paneles ──
    for i in range(6):
        angulo = math.radians(i * 60)
        # Costura como cilindro fino curvo
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.018, depth=0.75,
            location=(math.sin(angulo) * 0.52, math.cos(angulo) * 0.46, 0.32),
            vertices=8
        )
        costura = bpy.context.active_object
        costura.name = f"Costura_{i}"
        # Inclinar hacia el botón superior
        costura.rotation_euler = (
            math.radians(-18) * math.cos(angulo),
            math.radians(-18) * math.sin(angulo),
            angulo
        )
        bpy.ops.object.transform_apply(rotation=True)
        objetos.append(costura)

    # ── 5. BOTÓN superior ──
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.075, location=(0, 0, 0.75),
        segments=16, ring_count=12
    )
    boton = bpy.context.active_object
    boton.name = "Boton"
    bpy.ops.object.shade_smooth()
    objetos.append(boton)

    # ── 6. OJETES (ventilación) ──
    for i in range(6):
        angulo = math.radians(i * 60 + 30)
        bpy.ops.mesh.primitive_torus_add(
            location=(math.sin(angulo) * 0.82, math.cos(angulo) * 0.72, 0.28),
            major_radius=0.045,
            minor_radius=0.015,
        )
        ojete = bpy.context.active_object
        ojete.name = f"Ojete_{i}"
        ojete.rotation_euler = (
            math.radians(90) * math.cos(angulo),
            math.radians(90) * math.sin(angulo),
            angulo
        )
        bpy.ops.object.transform_apply(rotation=True)
        objetos.append(ojete)

    # ── Asignar material y unir ──
    mat = crear_material("Tela", color_rgba)
    for obj in objetos:
        obj.data.materials.clear()
        obj.data.materials.append(mat)

    bpy.ops.object.select_all(action='DESELECT')
    for obj in objetos:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objetos[0]
    bpy.ops.object.join()

    return bpy.context.active_object


def configurar_camara_y_luces():
    # Eliminar cámara y luces existentes
    for obj in bpy.data.objects:
        if obj.type in ['CAMERA', 'LIGHT']:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Cámara en posición 3/4 frontal (igual que foto de referencia)
    bpy.ops.object.camera_add(location=(2.2, -1.8, 1.6))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(58), 0, math.radians(51))
    cam.data.lens = 85  # focal larga para menos distorsión
    bpy.context.scene.camera = cam

    # Luz principal (key light) — arriba izquierda
    bpy.ops.object.light_add(type='AREA', location=(-3, -2, 5))
    luz1 = bpy.context.active_object
    luz1.data.energy = 1200
    luz1.data.size = 4
    luz1.rotation_euler = (math.radians(45), 0, math.radians(-30))

    # Luz de relleno — derecha suave
    bpy.ops.object.light_add(type='AREA', location=(4, 2, 2))
    luz2 = bpy.context.active_object
    luz2.data.energy = 300
    luz2.data.size = 5
    luz2.data.color = (0.9, 0.95, 1.0)

    # Luz trasera — borde
    bpy.ops.object.light_add(type='AREA', location=(0, 4, 3))
    luz3 = bpy.context.active_object
    luz3.data.energy = 400
    luz3.data.size = 3


def configurar_render():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 200
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 900
    scene.render.resolution_y = 750
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.compression = 15

    # Usar CPU (compatible con Intel HD 4000)
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'NONE'
    scene.cycles.device = 'CPU'


def renderizar_todos():
    # Limpiar todo
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    configurar_camara_y_luces()
    configurar_render()

    for nombre, color in COLORES:
        print(f"\n>>> Renderizando: {nombre}")
        limpiar_objetos()
        construir = crear_gorra(color)

        ruta = os.path.join(OUTPUT_DIR, f"gorra-{nombre}.png")
        bpy.context.scene.render.filepath = ruta
        bpy.ops.render.render(write_still=True)
        print(f"✓ {ruta}")

    print("\n✅ Todas las gorras completadas.")


renderizar_todos()
