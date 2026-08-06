import { clsx } from "clsx";

export function TitanAvatar({ size = 34 }: { size?: number }) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-black"
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      T
    </div>
  );
}
