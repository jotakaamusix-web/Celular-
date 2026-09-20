# App de diagnóstico para tu setter

App web con:

- **Chat con IA** por negocio: responde solo con la info que tú cargas (protocolo, servicios, precios, cómo negociar). Cada número/negocio tiene su propio contexto, así que la IA nunca mezcla la info de uno con la del otro.
- **Diagnóstico diario**: un anotador donde se registra cómo fue el día en ese número (qué pasó, dudas, próximos pasos).
- **Protocolo & Info**: donde tú cargas todo lo que la IA y tu setter necesitan, organizado por secciones (protocolo, servicios, precios, negociación, otros). Editable solo por ti (dueño); tu setter lo puede leer.
- **2 modos visuales**, uno por negocio: cada uno con su propio color y tipografía (se configuran en la tabla `businesses`, no hay que tocar código para cambiarlos).
- **Panel del dueño**: ves de un vistazo las últimas dudas que tu setter le hizo a la IA y los últimos diagnósticos, de ambos números a la vez.
- Todo se guarda en una base de datos compartida (Supabase), así que ambos ven lo mismo desde cualquier dispositivo.

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → crea un proyecto nuevo (gratis).
2. En **SQL Editor**, pega y corre el contenido de [`supabase/schema.sql`](./supabase/schema.sql). Esto crea las tablas, la seguridad (RLS) y dos negocios de ejemplo ("Negocio A" y "Negocio B").
3. En **Authentication → Users**, crea dos usuarios (con email y contraseña): uno para ti y otro para tu setter.
4. Vuelve al **SQL Editor** y corre (reemplazando los IDs, que puedes copiar desde la lista de usuarios):

   ```sql
   update public.profiles set role = 'owner', full_name = 'Tu nombre' where id = '<tu-user-id>';
   update public.profiles set full_name = 'Nombre de tu setter' where id = '<user-id-de-tu-setter>';
   ```

   Solo tú debes quedar con `role = 'owner'`. Tu setter queda como `setter` (el valor por defecto).

5. En **Project Settings → API**, copia la `Project URL` y la `anon public key`.

## 2. Conseguir tu clave de Anthropic (para el chat con IA)

1. Ve a [console.anthropic.com](https://console.anthropic.com) → **API Keys** → crea una clave.
2. Esa clave solo se usa en el servidor (nunca llega al navegador de tu setter).

## 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

## 4. Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`, entra con tu usuario y elige un negocio.

## 5. Personalizar tus 2 negocios

Ya logueado como dueño, entra a **Protocolo & Info** de cada negocio y carga:

- **Protocolo a cumplir**: reglas que tu setter debe seguir en ese número.
- **Servicios**, **Precios**, **Cómo negociar**, **Otros datos**: todo lo que la IA necesita para responder sin tener que preguntarte.

Para cambiar el nombre real, número de teléfono, color y tipografía de cada negocio, edita la tabla `businesses` desde el **Table Editor** de Supabase (o pídeme que agregue una pantalla de edición si la quieres desde la app).

## 6. Publicar la app (para que tu setter la use desde su celular)

La forma más simple es desplegarla en [Vercel](https://vercel.com):

1. Sube este proyecto a un repositorio de GitHub.
2. En Vercel, importa el repo y configura las mismas variables de entorno del paso 3.
3. Deploy. Comparte el link con tu setter (y su usuario/contraseña).

## Cómo funciona el chat con la IA

Cada vez que alguien pregunta algo en el chat de un negocio, el servidor arma un mensaje de "system" con toda la información que cargaste en **Protocolo & Info** de ESE negocio, y se lo manda a Claude junto con el historial de esa conversación. La IA responde solo con esa información — si algo no está cargado, lo dice en vez de inventar, y sugiere anotarlo como pendiente.

Todas las preguntas y respuestas quedan guardadas y son visibles para ti en el **Panel del dueño**.
