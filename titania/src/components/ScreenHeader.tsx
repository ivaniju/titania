"use client";

import { useRouter } from "next/navigation";

export function ScreenHeader({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: string;
}) {
  const router = useRouter();
  return (
    <div className="px-1 pb-1 pt-4">
      <button
        onClick={() => router.push(back ?? "/home")}
        aria-label="Atrás"
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-glass text-sm text-text-dim transition-opacity active:opacity-60"
      >
        ←
      </button>
      <div className="text-[26px] font-extrabold tracking-[-0.4px]">{title}</div>
      {subtitle && (
        <p className="mt-1 text-[13.5px] leading-[1.5] text-text-dim">{subtitle}</p>
      )}
    </div>
  );
}
