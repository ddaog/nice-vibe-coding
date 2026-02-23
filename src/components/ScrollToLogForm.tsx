"use client";

import { useEffect } from "react";

export function ScrollToLogForm({ trigger }: { trigger?: string }) {
  useEffect(() => {
    if (trigger) {
      const el = document.getElementById("log-activity");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [trigger]);
  return null;
}
