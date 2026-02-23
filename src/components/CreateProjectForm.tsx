"use client";

import { useState } from "react";
import { createProject } from "@/lib/actions/projects";
import { useTranslations } from "next-intl";
import type { ProjectStatus } from "@/types";

const STATUSES: ProjectStatus[] = ["idea", "building", "blocked", "launched"];
const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "bg-zinc-600",
  building: "bg-emerald-600",
  blocked: "bg-amber-600",
  launched: "bg-blue-600",
};

export function CreateProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations("createProject");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("idea");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createProject(title.trim(), description.trim(), status);
      setTitle("");
      setDescription("");
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-colors overflow-visible border-dashed"
    >
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className={`px-2 py-1 rounded text-xs font-medium text-white cursor-pointer border-0 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none ${STATUS_COLORS[status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="text-xs px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500/80 text-white disabled:opacity-50"
          >
            {loading ? t("creating") : t("addProject")}
          </button>
        </div>
      </div>
    </form>
  );
}
