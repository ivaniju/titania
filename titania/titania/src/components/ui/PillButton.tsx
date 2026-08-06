"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export function PillButton({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={clsx(
        "rounded-full px-5 py-[11px] text-[13px] font-bold transition-opacity",
        variant === "primary" && "bg-accent text-black",
        variant === "secondary" && "border border-border-strong bg-transparent text-text",
        variant === "ghost" && "bg-transparent text-text-dim",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
