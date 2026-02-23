"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { updateActivity, deleteActivity } from "@/lib/actions/activities";
import type { Activity, ActivityType } from "@/types";

const ACTIVITY_TYPES: ActivityType[] = ["dev", "marketing", "monetization", "analytics", "planning"];
const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  dev: "rgb(16, 185, 129)",
  marketing: "rgb(139, 92, 246)",
  monetization: "rgb(245, 158, 11)",
  analytics: "rgb(14, 165, 233)",
  planning: "rgb(244, 63, 94)",
};

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function DayDetailModal({
  date,
  activities,
  projectTitles,
  onClose,
  onAddActivity,
}: {
  date: string;
  activities: Activity[];
  projectTitles: Record<string, string>;
  onClose: () => void;
  onAddActivity: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("logActivity");
  const tHeatmap = useTranslations("heatmap");
  const tCard = useTranslations("projectCard");
  const locale = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<ActivityType>("dev");
  const [editNote, setEditNote] = useState("");
  const weekdays = locale.startsWith("ja") ? WEEKDAY_JA : locale.startsWith("en") ? WEEKDAY_EN : WEEKDAY_KO;
  const d = new Date(date + "T12:00:00");
  const weekday = weekdays[d.getDay()];
  const dateStr = `${date} (${weekday})`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-100">{dateStr}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-500">{tHeatmap("noActivities")}</p>
          ) : (
            <ul className="space-y-2">
              {activities.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg bg-zinc-800/50"
                >
                  {editingId === a.id ? (
                    <div className="flex-1 space-y-2">
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as ActivityType)}
                        className="w-full px-2 py-1 rounded bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs"
                      >
                        {ACTIVITY_TYPES.map((type) => (
                          <option key={type} value={type}>{t(type)}</option>
                        ))}
                      </select>
                      <input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder={t("notePlaceholder")}
                        className="w-full px-2 py-1 rounded bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs placeholder-zinc-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateActivity(a.id, { type: editType, note: editNote || null });
                            setEditingId(null);
                            router.refresh();
                          }}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                        >
                          {tCard("save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 rounded bg-zinc-600 hover:bg-zinc-500 text-zinc-200 text-xs"
                        >
                          {tCard("cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span
                        className="w-2.5 h-2.5 rounded shrink-0 mt-0.5"
                        style={{ backgroundColor: ACTIVITY_TYPE_COLORS[a.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-zinc-300">{projectTitles[a.project_id] ?? a.project_id}</span>
                        <span className="text-zinc-500 mx-1">·</span>
                        <span className="text-zinc-400">{t(a.type)}</span>
                        {a.note && <p className="text-zinc-500 text-xs mt-0.5">{a.note}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(a.id);
                            setEditType(a.type);
                            setEditNote(a.note ?? "");
                          }}
                          className="p-1 rounded text-zinc-400 hover:bg-zinc-600 hover:text-zinc-200"
                          title={tCard("edit")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(tCard("deleteConfirm"))) {
                              await deleteActivity(a.id);
                              router.refresh();
                            }
                          }}
                          className="p-1 rounded text-zinc-400 hover:bg-red-900/50 hover:text-red-400"
                          title={tCard("delete")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t border-zinc-700">
          <button
            type="button"
            onClick={onAddActivity}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
          >
            {activities.length === 0 ? tHeatmap("addActivity") : tHeatmap("addMoreActivity")}
          </button>
        </div>
      </div>
    </div>
  );
}
