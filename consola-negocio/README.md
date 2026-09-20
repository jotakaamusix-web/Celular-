# Consola del negocio (Claude Artifact)

`index.html` es el código fuente de la app que ya está publicada y en uso aquí:

**https://claude.ai/artifact/L1vsNcgUPiu6tcVoHmu4uQ**

Es un **Claude Artifact**, no un sitio web normal: el chat con IA, la base de
datos (protocolos, diagnósticos, mensajes) y quién es el dueño/setter
funcionan a través de `window.claude` — capacidades que **solo existen
dentro del visor de Claude** (claude.ai/code). Si abres `index.html`
directo en un navegador o con un servidor local, la página carga pero el
chat, el guardado y el saber quién eres no van a funcionar: eso es
esperado, no un bug.

## Cómo seguir editándola desde Claude Code

1. Abre Claude Code en esta carpeta (local o en la nube) y dile algo como:
   > "Lee `consola-negocio/index.html` y `consola-negocio/README.md`. Esta es
   > la Consola del negocio, un Claude Artifact ya publicado en
   > https://claude.ai/artifact/L1vsNcgUPiu6tcVoHmu4uQ. Quiero cambiar [lo que sea]."
2. Pídele que use su herramienta de **Artifact** para volver a publicar en
   esa misma URL (pasando `url` para actualizar, no crear uno nuevo) después
   de editar el archivo — así el link que ya compartiste con tu setter se
   actualiza solo, sin generar un link nuevo.
3. Si Claude Code no tiene la herramienta `Artifact` disponible en esa
   sesión (pasa en algunas configuraciones locales), pídele igual que edite
   `index.html` aquí, y luego tú pegas el contenido del archivo en un chat
   de claude.ai que sí pueda publicarlo.

## Capacidades que declara (no las borres sin razón)

- `db` — guarda negocios, protocolo/info, diagnósticos y chat. Reglas: solo
  el dueño (nivel "Can edit" en el menú de compartir) puede escribir en
  `businesses` y `business_info`; cualquiera invitado con "Can interact"
  (como el setter) puede leer todo y escribir chat/diagnósticos.
- `user` — para saber si quien mira es el dueño o un invitado, y mostrar
  nombres.
- `sample` — el chat con IA; usa el uso de Claude de quien esté chateando
  (no necesita clave de API).

## Estructura del código

Todo vive en `index.html`: `<style>` con los tokens de color/tema (claro y
oscuro), el HTML de las 4 pestañas (Chat IA, Diagnóstico diario, Protocolo
& Info, Panel del dueño), y un `<script>` con toda la lógica en JS plano
(sin frameworks). Los dos negocios (`negocio-a` / `negocio-b`) están
sembrados en la base de datos del artifact, no en el código — para
cambiarlos usa la pantalla de edición dentro de la app (como dueño) o la
herramienta `ArtifactData`.

## La otra versión (más completa, para más adelante)

En `../setter-app/` está la versión con Next.js + Supabase + Vercel — más
control (login propio, hosting propio) pero más pasos de configuración.
Sigue ahí guardada por si en el futuro quieres migrar a esa.
