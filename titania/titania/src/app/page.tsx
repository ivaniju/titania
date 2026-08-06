"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();
  const onboardingCompleted = useTitanStore((s) => s.onboardingCompleted);

  useEffect(() => {
    router.replace(onboardingCompleted ? "/home" : "/onboarding");
  }, [onboardingCompleted, router]);

  return null;
}
