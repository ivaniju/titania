import { clsx } from "clsx";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  strong = false,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-[28px] border backdrop-blur-xl",
        strong ? "bg-glass-strong border-border-strong" : "bg-glass border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
