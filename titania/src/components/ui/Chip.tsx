"use client";

import { motion } from "framer-motion";

export function Chip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="rounded-full border border-border-strong bg-glass px-[18px] py-[11px] text-[13px] font-semibold text-text transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </motion.button>
  );
}
