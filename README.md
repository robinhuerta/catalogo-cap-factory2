
# 🧢 Cap Factory | Catálogo Premium B2B

Este es un catálogo digital de alta gama diseñado para fábricas de gorras que buscan mostrar sus muestras de producción a clientes mayoristas y corporativos.

## 🚀 Características

- **Diseño Premium**: Interfaz moderna, limpia y optimizada para dispositivos móviles (Mobile First).
- **Galería Inteligente**: Visualización de muestras con fichas técnicas detalladas (telas, bordados, acabados).
- **Sistema de Cotización**: Los clientes pueden añadir modelos a una lista y enviarla directamente por WhatsApp.
- **Filtros Avanzados**: Búsqueda por texto y filtrado por categorías (Snapback, Trucker, etc.).
- **Secciones Corporativas**: Portafolio de clientes, tecnología de fábrica y beneficios B2B.

## 🛠️ Personalización de Fotos (Guía Rápida)

Para cambiar las fotos por las de tu propia fábrica:

1. Crea una carpeta llamada `images` en la raíz del proyecto.
2. Sube tus imágenes allí (ejemplo: `mi-gorra-negra.jpg`).
3. Abre el archivo `constants.ts`.
4. Busca la sección `CAPS_DATA` y cambia la propiedad `imagen`:
   ```typescript
   imagen: "./images/mi-gorra-negra.jpg"
   ```

## 📦 Cómo subir a GitHub

1. Inicializa el repositorio: `git init`
2. Añade los archivos: `git add .`
3. Primer commit: `git commit -m "Versión inicial del catálogo"`
4. Crea un repositorio en GitHub.com.
5. Sincroniza y sube:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSIORIO.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Despliegue en Netlify

1. Entra en [Netlify](https://www.netlify.com/).
2. Conecta tu cuenta de GitHub.
3. Selecciona este repositorio.
4. ¡Listo! Tu catálogo estará en línea automáticamente.

---
Desarrollado con ❤️ para la industria textil.
