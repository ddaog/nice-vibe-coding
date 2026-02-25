"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY_SORT = "vibe-coder-sort";
const STORAGE_KEY_PROJECT_FILTER = "vibe-coder-projectFilter";
const STORAGE_KEY_LAYOUT = "vibe-coder-projectLayout";

export function DashboardFilterSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sort = searchParams.get("sort");
    const projectFilter = searchParams.get("projectFilter");
    const layout = searchParams.get("layout");
    const localSort = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_SORT) : null;
    const localFilter = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_PROJECT_FILTER) : null;
    const localLayout = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_LAYOUT) : null;

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (!sort && localSort && (localSort === "recent" || localSort === "active")) {
      params.set("sort", localSort);
      changed = true;
    }
    if (!projectFilter && localFilter) {
      params.set("projectFilter", localFilter);
      changed = true;
    }
    if (!layout && localLayout && (localLayout === "grid" || localLayout === "list")) {
      params.set("layout", localLayout);
      changed = true;
    }

    if (changed) {
      router.replace(`/dashboard?${params.toString()}`);
    }
  }, [router, searchParams]);

  return null;
}
