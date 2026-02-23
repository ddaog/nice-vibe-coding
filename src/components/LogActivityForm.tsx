"use client";

import { useState, useEffect } from "react";
import { logActivity } from "@/lib/actions/activities";
import { useTranslations } from "next-intl";
import type { Project } from "@/types";
import type { ActivityType } from "@/types";

const ACTIVITY_TYPES: ActivityType[] = [
  "dev",
  "marketing",
  "monetization",
  "analytics",
  "planning",
];

export function LogActivityForm({
  projects,
  onSuccess,
  initialDate,
  initialProjectId,
}: {
  projects: Project[];
  onSuccess?: () => void;
  initialDate?: string;
  initialProjectId?: string;
}) {
  const t = useTranslations("logActivity");
  const [projectId, setProjectId] = useState(
    initialProjectId ?? projects[0]?.id ?? ""
  );
  const [date, setDate] = useState(
    initialDate ?? new Date().toISOString().slice(0, 10)
  );
  const [type, setType] = useState<ActivityType>("dev");
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);
  useEffect(() => {
    if (initialProjectId && projects.some((p) => p.id === initialProjectId)) setProjectId(initialProjectId);
  }, [initialProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setLoading(true);
    try {
      await logActivity(projectId, date, type, intensity, note || undefined);
      setNote("");
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
        <label className="text-xs text-zinc-400">{t("project")}</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">{t("date")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">{t("type")}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {ACTIVITY_TYPES.map((activityType) => (
            <option key={activityType} value={activityType}>
              {t(activityType)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">{t("intensity")}</label>
        <select
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
        <label className="text-xs text-zinc-400">{t("note")}</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? t("logging") : t("log")}
      </button>
    </form>
  );
}
