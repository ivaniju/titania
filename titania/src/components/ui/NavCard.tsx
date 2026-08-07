"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function NavCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => router.push(href)}
      className="flex flex-col items-start gap-2.5 rounded-[22px] border border-border bg-glass p-4 text-left"
    >
      <span className="text-[22px]">{icon}</span>
      <div>
        <div className="text-[13.5px] font-bold leading-tight">{title}</div>
        <div className="mt-0.5 text-[11.5px] leading-tight text-text-dim">{subtitle}</div>
      </div>
    </motion.button>
  );
}
