"use client";

import { ReactNode, useEffect } from "react";
import { initPostHog } from "@/lib/services/analytics";

type Props = {
  children: ReactNode;
};

export function PostHogProvider({ children }: Props) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}


