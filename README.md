
# 🎸 ToneShare - Guía de Instalación en BanaHosting

ToneShare es una plataforma de alta gama para músicos que utiliza Inteligencia Artificial (Google Gemini) para optimizar cadenas de señal y crear una comunidad vibrante de tono.

## 🧠 ¿Qué hace la IA de Gemini aquí?

La aplicación utiliza el modelo `gemini-3-flash-preview` para dos funciones críticas:
1. **Asistente de Tono**: Analiza tu configuración de pedales y amplificador para sugerirte el "eslabón perdido" en tu sonido.
2. **Bienvenida Inteligente**: Genera saludos personalizados basados en tus gustos musicales al registrarte.

---

## 🚀 Pasos para la Instalación (BanaHosting / cPanel)

### 1. Preparación del Servidor
1. Entra a tu **cPanel** de BanaHosting.
2. Busca la opción **MySQL Database Wizard**:
   - Crea una base de datos (ej: `tuusuario_toneshare`).
   - Crea un usuario y contraseña.
   - **Anota estos datos**, los necesitarás para las variables de entorno.
3. Busca **Setup Node.js App**:
   - Haz clic en "Create Application".
   - **Application root**: La carpeta donde subirás los archivos (ej: `toneshare`).
   - **Application URL**: Tu dominio o subdominio.
   - **Application startup file**: Escribe `server.js`.

### 2. Variables de Entorno
Dentro de la configuración de la app Node.js en cPanel, añade estas variables en la sección "Environment variables":
- `DB_HOST`: `localhost`
- `DB_NAME`: El nombre de la base de datos creada.
- `DB_USER`: El usuario de la base de datos.
- `DB_PASSWORD`: La contraseña del usuario.
- `API_KEY`: Tu llave de Google Gemini API (consíguela en [ai.google.dev](https://ai.google.dev)).

### 3. Subida de Archivos
1. Sube todos los archivos del proyecto a la carpeta que definiste como `Application root`.
2. Asegúrate de incluir:
   - `server.js`
   - `setup_db.sql`
   - La carpeta `dist` (que contiene el build de React).
   - `package.json`

### 4. Instalación del Sistema (Asistente Mágico)
1. Una vez subido todo, inicia la aplicación desde cPanel (botón "Start App").
2. Abre tu dominio en el navegador.
3. El sistema detectará automáticamente que la base de datos está vacía y te mostrará la pantalla de **"System Setup"**.
4. Haz clic en el botón **"Run SQL Install Script"**.
5. El sistema ejecutará el archivo `setup_db.sql`, creará las tablas y se reiniciará automáticamente.

---

## 🛠️ Mantenimiento Técnico
- **Logs**: Puedes ver los errores en la misma sección de "Setup Node.js App" de cPanel si algo falla.
- **Base de Datos**: Si deseas ver los datos manualmente, usa **phpMyAdmin** en tu cPanel.
- **Escalabilidad**: El servidor está configurado para usar un Pool de conexiones, lo que garantiza que pueda manejar múltiples músicos al mismo tiempo sin colapsar la base de datos.

---
*Desarrollado con ❤️ para músicos profesionales.*
