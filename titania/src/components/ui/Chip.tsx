"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

export function Chip({
  label,
  onClick,
  selected,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={clsx(
        "rounded-full border px-[18px] py-[11px] text-[13px] font-semibold transition-colors",
        selected
          ? "border-accent bg-accent-dim text-accent"
          : "border-border-strong bg-glass text-text hover:border-accent hover:text-accent"
      )}
    >
      {label}
    </motion.button>
  );
}
