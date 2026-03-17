# Web App

Frontend del MVP de Football Tracker.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase JS

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Variables de entorno

Copiar `web/.env.example` y completar:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Si no estan definidas, la app usa seed local.

## Pantallas actuales

- `/`
- `/confirmar`
- `/partido`
- `/historial`
- `/jugadores`
- `/admin`
