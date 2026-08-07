"use client";

import { clsx } from "clsx";
import type { CalendarDay } from "@/lib/store";

function statusFor(day?: CalendarDay): "perfecto" | "aceptable" | "vacio" {
  if (!day) return "vacio";
  const okCount = [day.trained, day.mealsOk, day.waterOk].filter(Boolean).length;
  if (okCount >= 2) return "perfecto";
  if (okCount === 1) return "aceptable";
  return "vacio";
}

const STATUS_CLASS: Record<string, string> = {
  perfecto: "bg-emerald-400",
  aceptable: "bg-amber-400",
  vacio: "bg-white/10",
};

export function CalendarMonth({ log }: { log: Record<string, CalendarDay> }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] font-bold capitalize">{monthLabel}</div>
        <div className="flex items-center gap-3 text-[10.5px] text-text-dim">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Perfecto
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Aceptable
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-white/10" /> Sin actividad
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-text-dimmer">
            {d}
          </div>
        ))}
        {cells.map((dayNum, i) => {
          if (dayNum === null) return <div key={`empty-${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const status = statusFor(log[iso]);
          const isToday = dayNum === now.getDate();
          return (
            <div
              key={iso}
              className={clsx(
                "flex aspect-square items-center justify-center rounded-[8px] text-[10px] font-semibold",
                STATUS_CLASS[status],
                status === "vacio" ? "text-text-dimmer" : "text-black/70",
                isToday && "ring-2 ring-accent"
              )}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
