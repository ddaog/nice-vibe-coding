"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logActivity } from "@/lib/actions/activities";
import { useTranslations } from "next-intl";
import type { ActivityType } from "@/types";

const ACTIVITY_TYPES: ActivityType[] = [
  "dev",
  "marketing",
  "monetization",
  "analytics",
  "planning",
];

export function LogActivityModal({
  projectId,
  projectTitle,
  onClose,
  onSuccess,
}: {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("logActivity");
  const tCard = useTranslations("projectCard");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<ActivityType>("dev");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setLoading(true);
    try {
      await logActivity(projectId, date, type, 1, note || undefined);
      setNote("");
      router.refresh();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-activity-modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 id="log-activity-modal-title" className="text-lg font-semibold text-zinc-100">
            {t("logActivity")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">{t("project")}</label>
            <div className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm">
              {projectTitle}
            </div>
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
            <label className="text-xs text-zinc-400">{t("note")}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium transition-colors"
            >
              {tCard("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? t("logging") : t("log")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
