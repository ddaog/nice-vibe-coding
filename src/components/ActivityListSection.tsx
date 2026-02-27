"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Activity, ActivityType } from "@/types";

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

export function ActivityListSection({
  activities,
  projectTitles,
}: {
  activities: Activity[];
  projectTitles: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("logActivity");
  const tHeatmap = useTranslations("heatmap");
  const tDashboard = useTranslations("dashboard");
  const locale = useLocale();
  const weekdays = locale.startsWith("ja") ? WEEKDAY_JA : locale.startsWith("en") ? WEEKDAY_EN : WEEKDAY_KO;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("activityList");
    router.replace(`/dashboard?${params.toString()}`);
  };

  const sorted = [...activities].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });

  const byDate = sorted.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  return (
    <section className="mt-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">{tDashboard("activityListTitle")}</h3>
        <button
          type="button"
          onClick={handleClose}
          className="text-sm text-zinc-400 hover:text-zinc-300 underline underline-offset-2"
        >
          {tDashboard("closeList")}
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-zinc-500">{tHeatmap("noActivities")}</p>
        ) : (
          <ul className="space-y-4">
            {Object.entries(byDate).map(([date, dayActivities]) => {
              const d = new Date(date + "T12:00:00");
              const weekday = weekdays[d.getDay()];
              return (
                <li key={date}>
                  <p className="text-xs text-zinc-500 mb-2">{date} ({weekday})</p>
                  <ul className="space-y-2">
                    {dayActivities.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start gap-2 text-sm p-2 rounded-lg bg-zinc-800/50"
                      >
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
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
