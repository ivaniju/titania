import { clsx } from "clsx";

export function TitanAvatar({ size = 34, pulse }: { size?: number; pulse?: boolean }) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-black",
        pulse && "animate-pulse-glow"
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      T
    </div>
  );
}
