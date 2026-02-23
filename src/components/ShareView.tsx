"use client";

import { useTranslations } from "next-intl";
import { Heatmap } from "./Heatmap";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { UserStats } from "@/types";
import type { DayActivity } from "@/types";

interface ShareViewProps {
  username: string;
  stats: UserStats;
  dayActivities: Record<string, DayActivity>;
  startDate: string;
  endDate: string;
  tagline: string;
  hideNav?: boolean;
}

export function ShareView({
  username,
  stats,
  dayActivities,
  startDate,
  endDate,
  tagline,
  hideNav = false,
}: ShareViewProps) {
  const t = useTranslations("share");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-zinc-100 overflow-hidden relative">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.08), transparent)," +
            "radial-gradient(ellipse 60% 40% at 100% 100%, rgba(16, 185, 129, 0.04), transparent)," +
            "radial-gradient(ellipse 50% 30% at 0% 80%, rgba(59, 130, 246, 0.03), transparent)",
        }}
      />

      {/* Minimal back link & locale - hidden in screenshot mode */}
      {!hideNav && (
        <>
          <a
            href="/dashboard"
            className="fixed top-6 left-6 z-20 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {tCommon("backToDashboard")}
          </a>
          <div className="fixed top-6 right-6 z-20">
            <LocaleSwitcher />
          </div>
        </>
      )}

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        {/* Animated fade-in */}
        <div
          className="w-full max-w-2xl animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          <h1
            className="text-2xl font-light tracking-tight text-zinc-100 mb-1"
            style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
          >
            {username}
          </h1>
          <p
            className="text-sm text-zinc-500 mb-10"
            style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
          >
            {tagline}
          </p>

          {/* Stats row - minimal typography */}
          <div className="flex gap-8 mb-12">
            <div>
              <p className="text-3xl font-light text-emerald-400/90 tabular-nums">
                {stats.totalActiveDays}
              </p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">
                {t("activeDays")}
              </p>
            </div>
            <div>
              <p className="text-3xl font-light text-emerald-400/90 tabular-nums">
                {stats.currentStreak}
              </p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">
                {t("currentStreak")}
              </p>
            </div>
          </div>

          {/* Heatmap with glow */}
          <div
            className="p-6 rounded-2xl border border-zinc-800/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(24, 24, 27, 0.6) 0%, rgba(9, 9, 11, 0.8) 100%)",
              boxShadow:
                "0 0 60px -20px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
          >
            <Heatmap
              dayActivities={dayActivities}
              startDate={startDate}
              endDate={endDate}
              variant="share"
            />
          </div>

          {/* Footer - minimal */}
          <p
            className="mt-8 text-xs text-zinc-600 text-center"
            style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
          >
            {tCommon("appName")}
          </p>
        </div>
      </main>
    </div>
  );
}
