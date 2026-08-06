import { clsx } from "clsx";
import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  strong?: boolean;
};

function GlassCardDiv({ children, className, strong }: GlassCardProps) {
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

export function GlassCard({
  children,
  className,
  strong = false,
}: GlassCardProps) {
  return (
    <GlassCardDiv strong={strong} className={className}>
      {children}
    </GlassCardDiv>
  );
}
