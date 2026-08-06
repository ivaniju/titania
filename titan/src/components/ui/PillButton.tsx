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
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        "rounded-full px-5 py-[11px] text-[13px] font-bold",
        variant === "primary"
          ? "bg-accent text-black"
          : "border border-border-strong bg-transparent text-text",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
