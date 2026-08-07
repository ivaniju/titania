"use client";

import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";

const TABS = [
  { href: "/home", icon: "⌂", label: "Inicio" },
  { href: "/entrenamiento", icon: "🏋", label: "Entreno" },
  { href: "/nutricion", icon: "🍽", label: "Nutrición" },
  { href: "/compra", icon: "🛒", label: "Compra" },
  { href: "/progreso", icon: "📈", label: "Progreso" },
  { href: "/titan", icon: "◎", label: "Titan" },
  { href: "/perfil", icon: "◐", label: "Perfil" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[480px] justify-around border-t border-border bg-black/75 px-1.5 pb-[26px] pt-3 backdrop-blur-2xl">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={clsx(
              "flex flex-col items-center gap-1 px-2",
              active ? "text-accent" : "text-text-dimmer"
            )}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[9.5px] font-semibold leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
