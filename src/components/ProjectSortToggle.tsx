"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SORT_OPTIONS = [
  { value: "ice", labelKey: "sortByIce" },
  { value: "recent", labelKey: "sortByRecent" },
  { value: "active", labelKey: "sortByActive" },
] as const;

export function ProjectSortToggle({ sort }: { sort?: string }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (sort === "ice" || sort === "recent" || sort === "active") ? sort : "recent";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "recent") params.delete("sort");
    else params.set("sort", value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {t(opt.labelKey)}
        </option>
      ))}
    </select>
  );
}
