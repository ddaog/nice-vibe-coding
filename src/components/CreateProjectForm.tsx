"use client";

import { useState } from "react";
import { createProject } from "@/lib/actions/projects";
import { useTranslations } from "next-intl";
import type { ProjectStatus } from "@/types";

const STATUSES: ProjectStatus[] = ["idea", "building", "blocked", "launched"];

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
      className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">{t("title")}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-xs text-zinc-400">{t("description")}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">{t("status")}</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(s)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? t("creating") : t("addProject")}
      </button>
    </form>
  );
}
