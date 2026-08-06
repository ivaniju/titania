# Titan — proyecto Next.js

Onboarding conversacional + Home, montados como app real (App Router, TypeScript, Tailwind v4, Zustand, Framer Motion), siguiendo el design system y la arquitectura definidos antes.

## Arrancar

    npm install
    npm run dev

Abre http://localhost:3000 — redirige automáticamente a /onboarding la primera vez, y a /home una vez completado (el estado se guarda en localStorage vía Zustand, listo para sustituir por Supabase).

## Estructura

    src/
      app/
        page.tsx            redirige según onboardingCompleted
        onboarding/page.tsx
        home/page.tsx
        globals.css         design tokens (colores, radios, fuente)
      components/
        ui/                 GlassCard, Chip, PillButton, TitanAvatar
        home/                TrainingCard, MealsRow, StatsRow, TitanMessage
        TabBar.tsx
      lib/
        store.ts             estado global (perfil + historial de chat)
        onboardingSteps.ts    preguntas del onboarding, fácil de ampliar

## Nota sobre la fuente

Este entorno de generación no tenía acceso a fonts.googleapis.com, así que globals.css usa la pila de fuentes del sistema (-apple-system/SF Pro), visualmente casi idéntica a Inter. Para producción, vuelve a activar Inter vía next/font/google en layout.tsx.

## Siguientes pasos naturales

- Conectar lib/store.ts a Supabase (tabla profiles) en vez de localStorage.
- Sustituir las preguntas fijas de onboardingSteps.ts por llamadas reales a la capa de IA.
- Construir /entrenamiento, /nutricion, /compra, /progreso, /titan siguiendo el mismo patrón de componentes.
