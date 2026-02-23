"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Project } from "@/types";

export function ProjectFilterSelect({
  projects,
  projectTitles,
  selectedId,
  otherParams,
}: {
  projects: Project[];
  projectTitles: Record<string, string>;
  selectedId?: string;
  otherParams?: string;
}) {
  const router = useRouter();
  const t = useTranslations("dashboard");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    const params = new URLSearchParams(otherParams || "");
    if (v) params.set("projectFilter", v);
    else params.delete("projectFilter");
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <select
      value={selectedId ?? ""}
      onChange={handleChange}
      className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
    >
      <option value="">{t("allProjects")}</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {projectTitles[p.id] ?? p.title}
        </option>
      ))}
    </select>
  );
}
