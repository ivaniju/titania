import { clsx } from "clsx";

export function ProgressBar({
  progress,
  className,
  colorClassName = "bg-accent",
}: {
  progress: number; // 0-1
  className?: string;
  colorClassName?: string;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-500", colorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
