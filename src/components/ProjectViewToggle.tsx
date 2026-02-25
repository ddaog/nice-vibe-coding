"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const STORAGE_KEY_LAYOUT = "vibe-coder-projectLayout";

export type ProjectLayout = "grid" | "list";

export function ProjectViewToggle({ layout }: { layout?: string }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const current: ProjectLayout = layout === "list" ? "list" : "grid";

  const handleChange = (value: ProjectLayout) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_LAYOUT, value);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", value);
    router.replace(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800/80 isolate">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleChange("grid");
        }}
        title={t("viewGrid")}
        className={`p-1.5 transition-colors ${
          current === "grid"
            ? "bg-emerald-600/80 text-white"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleChange("list");
        }}
        title={t("viewList")}
        className={`p-1.5 transition-colors ${
          current === "list"
            ? "bg-emerald-600/80 text-white"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
