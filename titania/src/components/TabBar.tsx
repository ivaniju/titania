"use client";

import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";

const TABS = [
  { href: "/home",          label: "Inicio",    icon: HomeIcon },
  { href: "/entrenamiento", label: "Entreno",   icon: WorkoutIcon },
  { href: "/nutricion",     label: "Nutrición", icon: NutritionIcon },
  { href: "/progreso",      label: "Progreso",  icon: ProgressIcon },
  { href: "/perfil",        label: "Perfil",    icon: ProfileIcon },
] as const;

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "rgba(255,255,255,0.4)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
        fill={active ? "rgba(198,255,0,0.15)" : "none"}
        stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function WorkoutIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "rgba(255,255,255,0.4)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="10.5" width="12" height="3" rx="1.5" stroke={c} strokeWidth="1.8" />
      <rect x="2" y="8" width="3" height="8" rx="1.5" stroke={c} strokeWidth="1.8" />
      <rect x="19" y="8" width="3" height="8" rx="1.5" stroke={c} strokeWidth="1.8" />
    </svg>
  );
}

function NutritionIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "rgba(255,255,255,0.4)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 2 4 6 4 10C4 14 7 17 11 17.9V22H13V17.9C17 17 20 14 20 10C20 6 16 2 12 2Z"
        stroke={c} strokeWidth="1.8" strokeLinejoin="round"
        fill={active ? "rgba(198,255,0,0.15)" : "none"} />
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "rgba(255,255,255,0.4)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <polyline points="3,17 9,11 13,14 21,7"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16,7 21,7 21,12"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "rgba(255,255,255,0.4)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"
        fill={active ? "rgba(198,255,0,0.15)" : "none"} />
      <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[480px] justify-around border-t border-border bg-black/80 pb-[env(safe-area-inset-bottom,20px)] pt-2.5 backdrop-blur-2xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)" }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={clsx(
              "flex flex-col items-center gap-[3px] px-3 py-1 transition-opacity",
              active ? "opacity-100" : "opacity-60 active:opacity-80"
            )}
          >
            <Icon active={active} />
            <span className={clsx(
              "text-[9.5px] font-semibold leading-none",
              active ? "text-accent" : "text-text-dimmer"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
