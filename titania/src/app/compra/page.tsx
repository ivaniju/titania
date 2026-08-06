"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";

const CATEGORIES = [
  "🥩 Proteínas",
  "🥦 Verduras",
  "🥣 Cereales",
  "🥛 Lácteos / Huevos",
  "🧂 Despensa",
  "🍎 Frutas",
  "🥫 Otros",
];

export default function CompraPage() {
  const ready = useRequireOnboarding();
  const shoppingList = useTitanStore((s) => s.shoppingList);
  const addShoppingItem = useTitanStore((s) => s.addShoppingItem);
  const removeShoppingItem = useTitanStore((s) => s.removeShoppingItem);
  const toggleShoppingItem = useTitanStore((s) => s.toggleShoppingItem);
  const resetShoppingList = useTitanStore((s) => s.resetShoppingList);
  const generateShoppingListFromMenu = useTitanStore((s) => s.generateShoppingListFromMenu);
  const profile = useTitanStore((s) => s.profile);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newQty, setNewQty] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!ready) return null;

  const market = profile.supermarket ?? "tu supermercado";
  const doneCount = shoppingList.filter((i) => i.checked).length;
  const pct = shoppingList.length > 0
    ? Math.round((doneCount / shoppingList.length) * 100)
    : 0;

  // Group by category
  const grouped: Record<string, typeof shoppingList> = {};
  shoppingList.forEach((item) => {
    grouped[item.category] = grouped[item.category] ?? [];
    grouped[item.category].push(item);
  });

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    addShoppingItem({ name, category: newCategory, quantity: newQty.trim() || undefined });
    setNewName("");
    setNewQty("");
    setShowAdd(false);
  }

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px]">
      <ScreenHeader title="Lista de la compra" subtitle={market} back="/home" />

      {/* Progress bar */}
      {shoppingList.length > 0 && (
        <div className="sticky top-0 z-10 -mx-4 bg-bg/90 px-4 pb-3 pt-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-[12px] font-semibold text-text-dim">
            <span>{doneCount}/{shoppingList.length} artículos · {pct}%</span>
            <button
              onClick={() => setConfirmReset(true)}
              className="text-text-dimmer underline underline-offset-2"
            >
              Reiniciar
            </button>
          </div>
          <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Confirmación reinicio */}
      {confirmReset && (
        <GlassCard className="p-4 border-danger/30 bg-danger-dim">
          <div className="text-[13px] font-bold text-danger mb-2">¿Reiniciar lista?</div>
          <div className="text-[12px] text-text-dim mb-3">Se desmarcará todo pero no se eliminará ningún artículo.</div>
          <div className="flex gap-2">
            <button onClick={() => { resetShoppingList(); setConfirmReset(false); }}
              className="rounded-full bg-danger px-4 py-2 text-[12px] font-bold text-white">
              Reiniciar
            </button>
            <button onClick={() => setConfirmReset(false)}
              className="rounded-full border border-border px-4 py-2 text-[12px] font-semibold">
              Cancelar
            </button>
          </div>
        </GlassCard>
      )}

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="flex-1 rounded-full border border-border bg-glass py-2.5 text-[12px] font-semibold"
        >
          + Añadir artículo
        </button>
        <button
          onClick={generateShoppingListFromMenu}
          className="flex-1 rounded-full bg-accent py-2.5 text-[12px] font-bold text-black"
        >
          🤖 Del menú
        </button>
      </div>

      {/* Formulario añadir */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <GlassCard className="p-4 flex flex-col gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nombre del artículo..."
              autoFocus
              className="w-full rounded-[10px] border border-border bg-glass px-3.5 py-2.5 text-[14px] outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <input
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="Cantidad (ej. 500g)"
                className="flex-1 rounded-[10px] border border-border bg-glass px-3.5 py-2.5 text-[14px] outline-none focus:border-accent"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 rounded-[10px] border border-border bg-glass px-3 py-2.5 text-[13px] outline-none focus:border-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="w-full rounded-full bg-accent py-2.5 text-[13px] font-bold text-black disabled:opacity-40"
            >
              Añadir
            </button>
          </GlassCard>
        </motion.div>
      )}

      {/* Lista vacía */}
      {shoppingList.length === 0 && (
        <GlassCard className="p-6 text-center">
          <div className="text-[32px] mb-2">🛒</div>
          <div className="text-[15px] font-bold">Lista vacía</div>
          <div className="text-[12px] text-text-dim mt-1 leading-relaxed">
            Añade artículos manualmente o genera la lista automáticamente desde tu menú semanal.
          </div>
        </GlassCard>
      )}

      {/* Completada */}
      {shoppingList.length > 0 && doneCount === shoppingList.length && (
        <div className="rounded-[20px] border border-accent bg-accent-dim p-4 text-center text-[13.5px] font-semibold text-accent">
          🛒 ¡Compra completada!
        </div>
      )}

      {/* Grupos */}
      <div className="flex flex-col gap-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="mb-2 px-1 flex items-center justify-between">
              <span className="text-[12px] font-bold text-text-dim">{category}</span>
              <span className="text-[11px] text-text-dimmer">
                {items.filter((i) => i.checked).length}/{items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className="flex flex-1 items-center gap-3 rounded-[14px] border border-border bg-glass px-4 py-3.5 text-left transition-all active:scale-[0.98]"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border text-[13px] font-bold transition-all ${
                      item.checked ? "border-accent bg-accent text-black" : "border-border-strong text-transparent"
                    }`}>✓</span>
                    <span className={`flex-1 text-[14px] transition-all ${
                      item.checked ? "text-text-dimmer line-through" : "text-text"
                    }`}>
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span className="text-[11px] text-text-dimmer shrink-0">{item.quantity}</span>
                    )}
                  </button>
                  <button
                    onClick={() => removeShoppingItem(item.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-border bg-glass text-[14px] text-text-dim transition-all active:bg-danger-dim active:text-danger"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TabBar />
    </div>
  );
}
