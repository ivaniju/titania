"use client";

import { useMemo } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { PillButton } from "@/components/ui/PillButton";

export default function CompraPage() {
  const ready = useRequireOnboarding();
  const shoppingList = useTitanStore((s) => s.shoppingList);
  const toggleShoppingItem = useTitanStore((s) => s.toggleShoppingItem);
  const resetShoppingList = useTitanStore((s) => s.resetShoppingList);

  const { grouped, pct, allDone } = useMemo(() => {
    const grouped: Record<string, typeof shoppingList> = {};
    shoppingList.forEach((item) => {
      grouped[item.category] = grouped[item.category] || [];
      grouped[item.category].push(item);
    });
    const doneCount = shoppingList.filter((i) => i.checked).length;
    const pct = Math.round((doneCount / shoppingList.length) * 100);
    return { grouped, pct, allDone: doneCount === shoppingList.length };
  }, [shoppingList]);

  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-[110px]">
      <ScreenHeader title="Lista de la compra" subtitle="Semana actual · Mercadona" />

      <div className="sticky top-0 z-10 -mx-5 bg-bg/90 px-5 pb-3 pt-1 backdrop-blur-md">
        <div className="flex items-center justify-between text-[12px] font-semibold text-text-dim">
          <span>{pct}% completado</span>
          <button onClick={resetShoppingList} className="text-text-dimmer underline">
            Reiniciar
          </button>
        </div>
        <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {allDone && (
        <div className="rounded-[20px] border border-accent bg-accent-dim p-4 text-center text-[13.5px] font-semibold text-accent">
          Compra completada 🛒
        </div>
      )}

      <div className="flex flex-col gap-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="mb-2 px-1 text-[12px] font-bold text-text-dim">
              {category}
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleShoppingItem(item.id)}
                  className="flex w-full items-center gap-3 rounded-[14px] border border-border bg-glass px-4 py-3.5 text-left"
                >
                  <span
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border text-[13px] font-bold " +
                      (item.checked
                        ? "border-accent bg-accent text-black"
                        : "border-border-strong text-transparent")
                    }
                  >
                    ✓
                  </span>
                  <span
                    className={
                      "text-[14px] " +
                      (item.checked ? "text-text-dimmer line-through" : "text-text")
                    }
                  >
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <PillButton
        variant="secondary"
        className="mt-1 w-full py-3 text-center"
        onClick={() => alert("Titan buscará sustituciones equivalentes automáticamente.")}
      >
        No encuentro un producto
      </PillButton>

      <TabBar />
    </div>
  );
}
