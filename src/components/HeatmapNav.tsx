"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeatmapNav({
  viewOffset,
  canGoPrev,
  canGoNext,
  startDate,
  endDate,
  otherParams = "",
}: {
  viewOffset: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  startDate: string;
  endDate: string;
  otherParams?: string;
}) {
  const t = useTranslations("heatmap");
  const start = new Date(startDate);
  const end = new Date(endDate);
  const label =
    start.getFullYear() === end.getFullYear()
      ? `${start.getFullYear()}`
      : `${start.getFullYear()} – ${end.getFullYear()}`;
  const q = (v: number) => `/dashboard?view=${v}${otherParams ? `&${otherParams}` : ""}`;

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Link
          href={canGoPrev ? q(viewOffset - 1) : "#"}
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 transition-colors ${
            canGoPrev ? "hover:bg-zinc-800 hover:text-zinc-200" : "opacity-40 cursor-not-allowed pointer-events-none"
          }`}
          aria-label={t("prev")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-sm font-medium text-zinc-300 min-w-[100px] text-center">{label}</span>
        <Link
          href={canGoNext ? q(viewOffset + 1) : "#"}
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 transition-colors ${
            canGoNext ? "hover:bg-zinc-800 hover:text-zinc-200" : "opacity-40 cursor-not-allowed pointer-events-none"
          }`}
          aria-label={t("next")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
