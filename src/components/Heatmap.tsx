"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import type { Activity, ActivityType, DayActivity } from "@/types";

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  dev: "rgb(16, 185, 129)",       // emerald
  marketing: "rgb(139, 92, 246)", // violet
  monetization: "rgb(245, 158, 11)", // amber
  analytics: "rgb(14, 165, 233)", // sky
  planning: "rgb(244, 63, 94)",   // rose
};

const ACTIVITY_TYPES: ActivityType[] = ["dev", "marketing", "monetization", "analytics", "planning"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface HeatmapProps {
  dayActivities: Map<string, DayActivity> | Record<string, DayActivity>;
  startDate: string;
  endDate: string;
  projectFilter?: string | null;
  typeFilter?: string | null;
  className?: string;
  variant?: "default" | "share";
  activitiesByDate?: Record<string, Activity[]>;
  onCellClick?: (date: string) => void;
}

export function Heatmap({
  dayActivities,
  startDate,
  endDate,
  projectFilter,
  typeFilter,
  className = "",
  variant = "default",
  activitiesByDate,
  onCellClick,
}: HeatmapProps) {
  const { grid, maxIntensity, monthStarts, weeks } = useMemo(() => {
    const map =
      dayActivities instanceof Map
        ? dayActivities
        : new Map(Object.entries(dayActivities));
    const start = new Date(startDate);
    const end = new Date(endDate);
    const maxIntensity = Math.max(
      1,
      ...Array.from(map.values()).map((d) => d.totalIntensity)
    );

    const raw: { date: string; intensity: number; count: number; byType?: Record<ActivityType, number> }[] = [];
    const cursor = new Date(start);
    cursor.setDate(cursor.getDate() - cursor.getDay());

    while (cursor <= end || cursor.getDay() !== 0) {
      const d = cursor.toISOString().slice(0, 10);
      const day = map.get(d);
      raw.push({
        date: d,
        intensity: day?.totalIntensity ?? 0,
        count: day?.count ?? 0,
        byType: day?.byType,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeks = Math.ceil(raw.length / 7);
    const grid: { date: string; intensity: number; count: number; byType?: Record<ActivityType, number> }[] = [];
    for (let col = 0; col < weeks; col++) {
      for (let row = 0; row < 7; row++) {
        const i = col * 7 + row;
        if (i < raw.length) grid.push(raw[i]);
      }
    }

    const monthStarts: { month: number; col: number }[] = [];
    let lastMonth = -1;
    for (let col = 0; col < weeks; col++) {
      const i = col * 7;
      if (i < raw.length) {
        const m = new Date(raw[i].date).getMonth();
        if (m !== lastMonth) {
          monthStarts.push({ month: m, col });
          lastMonth = m;
        }
      }
    }

    return { grid, maxIntensity, monthStarts, weeks };
  }, [
    dayActivities instanceof Map
      ? Array.from(dayActivities.entries())
      : Object.entries(dayActivities),
    startDate,
    endDate,
  ]);

  /** 강도 1-5 기준 오퍼시티 (0.25 ~ 1.0) */
  const getOpacity = (intensity: number) => {
    if (intensity <= 0) return 0;
    const ratio = intensity / maxIntensity;
    return 0.25 + 0.75 * Math.min(1, ratio);
  };

  const isShare = variant === "share";
  const t = useTranslations("heatmap");
  const tLog = useTranslations("logActivity");
  const locale = useLocale();
  const weekdays = locale.startsWith("ja") ? WEEKDAY_JA : locale.startsWith("en") ? WEEKDAY_EN : WEEKDAY_KO;
  const [hoveredCell, setHoveredCell] = useState<{ date: string; left: number; top: number; width: number; height: number } | null>(null);

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="leading-[16px]">{t("less")}</span>
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div
              key={l}
              className="w-4 h-4 rounded-sm shrink-0"
              style={
                isShare
                  ? {
                      backgroundColor: `rgba(16, 185, 129, ${l === 0 ? 0.06 : 0.25 + (l / 5) * 0.75})`,
                      boxShadow: l > 0 ? `0 0 8px rgba(16, 185, 129, ${0.1 + l * 0.05})` : "none",
                    }
                  : {
                      backgroundColor: "rgb(39, 39, 42)",
                      opacity: l === 0 ? 0.15 : 0.25 + (l / 5) * 0.75,
                    }
              }
            />
          ))}
          <span className="leading-[16px]">{t("more")}</span>
        </div>
        {!isShare && (
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {ACTIVITY_TYPES.map((type) => (
              <span key={type} className="flex items-center gap-1.5">
                <span
                  className="w-4 h-4 rounded-sm shrink-0"
                  style={{ backgroundColor: ACTIVITY_TYPE_COLORS[type] }}
                />
                <span className="leading-[16px]">{tLog(type)}</span>
              </span>
            ))}
          </div>
        )}
        {(projectFilter || typeFilter) && !isShare && (
          <span className="text-xs text-zinc-500">
            {[projectFilter, typeFilter].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-x-auto">
        <div
          className="inline-grid text-xs text-zinc-500"
          style={{
            gridTemplateColumns: `auto repeat(${weeks}, minmax(16px, 16px))`,
            gridTemplateRows: `repeat(7, minmax(16px, 16px)) 20px`,
            gap: "2px",
          }}
        >
          {DAY_LABELS.map((l, i) => (
            <span
              key={`day-${i}`}
              className="flex items-center justify-end pr-1.5 min-h-[16px]"
              style={{ gridRow: i + 1, gridColumn: 1, lineHeight: 1 }}
            >
              {l}
            </span>
          ))}
          {grid.map((cell, idx) => {
            const col = Math.floor(idx / 7) + 2;
            const row = (idx % 7) + 1;
              const opacity = getOpacity(cell.intensity);
              const isFuture = cell.date > new Date().toISOString().slice(0, 10);
              const activeTypes = cell.byType
                ? (ACTIVITY_TYPES.filter((type) => (cell.byType![type] ?? 0) > 0) as ActivityType[])
                : [];
              const dayActivities = activitiesByDate?.[cell.date] ?? [];
              const d = new Date(cell.date + "T12:00:00");
              const weekday = weekdays[d.getDay()];
              const emptyBg = isShare ? "rgba(16, 185, 129, 0.06)" : "rgba(39, 39, 42, 0.6)";
              const fallbackBg =
                cell.intensity === 0
                  ? emptyBg
                  : isShare
                    ? `rgba(16, 185, 129, ${opacity})`
                    : `rgba(39, 39, 42, ${opacity})`;
              const canClick = !isShare && onCellClick && !isFuture;

            return (
                <div
                  key={cell.date}
                  role={canClick ? "button" : undefined}
                  tabIndex={canClick ? 0 : undefined}
                  onClick={canClick ? () => onCellClick!(cell.date) : undefined}
                  onKeyDown={canClick ? (e) => e.key === "Enter" && onCellClick!(cell.date) : undefined}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCell({ date: cell.date, left: rect.left, top: rect.top, width: rect.width, height: rect.height });
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`group relative w-full h-full min-w-0 min-h-0 rounded-sm overflow-hidden transition-all duration-200 ${
                    isShare
                      ? "hover:ring-2 hover:ring-emerald-400/50 hover:ring-offset-1 hover:ring-offset-[#0c0c0f]"
                      : canClick
                        ? "hover:scale-110 hover:z-10 cursor-pointer"
                        : "hover:scale-110 hover:z-10"
                  }`}
                  style={{
                    gridColumn: col,
                    gridRow: row,
                    backgroundColor: activeTypes.length > 0 ? emptyBg : fallbackBg,
                    boxShadow:
                      isShare && cell.intensity > 0 && activeTypes.length === 0
                        ? `0 0 12px rgba(16, 185, 129, ${opacity * 0.5})`
                        : undefined,
                  }}
                >
                  {activeTypes.length > 0 ? (
                    (() => {
                      const typeOpacity = Math.max(0.4, opacity);
                      const colors = activeTypes.map((t) => ACTIVITY_TYPE_COLORS[t]);
                      if (activeTypes.length === 1) {
                        return (
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{ backgroundColor: colors[0], opacity: typeOpacity }}
                          />
                        );
                      }
                      if (activeTypes.length === 2) {
                        return (
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              background: `linear-gradient(135deg, ${colors[0]} 35%, ${colors[1]} 65%)`,
                              opacity: typeOpacity,
                            }}
                          />
                        );
                      }
                      if (activeTypes.length === 3) {
                        return (
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              background: `conic-gradient(from 0deg, ${colors[0]} 0deg 115deg, ${colors[1]} 125deg 235deg, ${colors[2]} 245deg 355deg, ${colors[0]} 360deg)`,
                              opacity: typeOpacity,
                            }}
                          />
                        );
                      }
                      if (activeTypes.length === 4) {
                        return (
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              background: `conic-gradient(from 45deg, ${colors[0]} 0deg 85deg, ${colors[1]} 95deg 175deg, ${colors[2]} 185deg 265deg, ${colors[3]} 275deg 355deg, ${colors[0]} 360deg)`,
                              opacity: typeOpacity,
                            }}
                          />
                        );
                      }
                      if (activeTypes.length === 5) {
                        return (
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              background: `conic-gradient(from 0deg, ${colors[0]} 0deg 68deg, ${colors[1]} 76deg 140deg, ${colors[2]} 148deg 212deg, ${colors[3]} 220deg 284deg, ${colors[4]} 292deg 356deg, ${colors[0]} 360deg)`,
                              opacity: typeOpacity,
                            }}
                          />
                        );
                      }
                      return null;
                    })()
                  ) : cell.intensity > 0 ? (
                    <div
                      className="absolute inset-0 rounded-sm"
                      style={{
                        backgroundColor: isShare
                          ? `rgba(16, 185, 129, ${opacity})`
                          : `rgba(39, 39, 42, ${opacity})`,
                        boxShadow: isShare ? `0 0 12px rgba(16, 185, 129, ${opacity * 0.5})` : undefined,
                      }}
                    />
                  ) : null}
                  {!isFuture && activeTypes.length === 0 && (
                    <div
                      className={`absolute inset-0 rounded-sm pointer-events-none ${
                        isShare ? "" : "group-hover:bg-white/5"
                      }`}
                    />
                  )}
                  {hoveredCell?.date === cell.date &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <div
                        className="fixed z-[9999] px-2 py-1.5 rounded text-xs whitespace-nowrap pointer-events-none shadow-lg"
                        style={{
                          left: hoveredCell.left + hoveredCell.width / 2,
                          top: hoveredCell.top - 4,
                          transform: "translate(-50%, -100%)",
                          ...(isShare
                            ? {
                                backgroundColor: "rgba(6, 78, 59, 0.95)",
                                color: "rgb(209, 250, 229)",
                                border: "1px solid rgba(6, 95, 70, 0.5)",
                              }
                            : {
                                backgroundColor: "rgb(39, 39, 42)",
                                color: "rgb(244, 244, 245)",
                              }),
                        }}
                      >
                        <div className="font-medium">{cell.date} ({weekday})</div>
                        {cell.count > 0 ? (
                          <div className="text-zinc-300 mt-0.5">
                            {cell.count} {cell.count === 1 ? t("activity") : t("activities")}
                            {cell.intensity > 0 && ` · ${t("intensity")} ${cell.intensity}`}
                            {activeTypes.length > 0 && (
                              <div className="mt-0.5">{activeTypes.map((type) => tLog(type)).join(", ")}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-zinc-500 mt-0.5">{t("noActivities")}</div>
                        )}
                      </div>,
                      document.body
                    )}
                </div>
              );
          })}
          {Array.from({ length: weeks }).map((_, col) => {
            const start = monthStarts.find((s) => s.col === col);
            return (
              <span
                key={`month-${col}`}
                className="flex items-center min-h-[16px]"
                style={{
                  gridColumn: col + 2,
                  gridRow: 8,
                }}
              >
                {start ? MONTH_LABELS[start.month] : ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
