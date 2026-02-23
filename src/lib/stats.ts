import type { Activity, ActivityType, DayActivity, UserStats } from "@/types";

const ACTIVITY_TYPES: ActivityType[] = [
  "dev",
  "marketing",
  "monetization",
  "analytics",
  "planning",
];

export function computeDayActivities(activities: Activity[]): Map<string, DayActivity> {
  const map = new Map<string, DayActivity>();
  for (const a of activities) {
    const existing = map.get(a.date);
    const total = (existing?.totalIntensity ?? 0) + a.intensity;
    const count = (existing?.count ?? 0) + 1;
    const base: Record<ActivityType, number> = {
      dev: 0,
      marketing: 0,
      monetization: 0,
      analytics: 0,
      planning: 0,
    };
    const prev = existing?.byType ?? base;
    const byType: Record<ActivityType, number> = { ...prev, [a.type]: (prev[a.type] ?? 0) + a.intensity };
    map.set(a.date, { date: a.date, totalIntensity: total, count, byType });
  }
  return map;
}

export function computeStats(
  activities: Activity[],
  projectTitles: Record<string, string>
): UserStats {
  const dayMap = computeDayActivities(activities);
  const activeDays = Array.from(dayMap.keys()).sort();

  const distribution: Record<ActivityType, number> = {
    dev: 0,
    marketing: 0,
    monetization: 0,
    analytics: 0,
    planning: 0,
  };
  let projectCounts: Record<string, number> = {};

  for (const a of activities) {
    distribution[a.type] += a.intensity;
    projectCounts[a.project_id] = (projectCounts[a.project_id] ?? 0) + a.intensity;
  }

  const totalDist = Object.values(distribution).reduce((s, v) => s + v, 0);
  for (const k of ACTIVITY_TYPES) {
    distribution[k] = totalDist > 0 ? Math.round((distribution[k] / totalDist) * 100) : 0;
  }

  const mostActiveProjectId = Object.entries(projectCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? null;
  const mostActiveProject = mostActiveProjectId
    ? projectTitles[mostActiveProjectId] ?? null
    : null;

  const today = new Date().toISOString().slice(0, 10);

  // Longest streak: max consecutive days
  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < activeDays.length; i++) {
    if (i === 0 || isConsecutive(activeDays[i - 1], activeDays[i])) run++;
    else run = 1;
    longestStreak = Math.max(longestStreak, run);
  }

  // Current streak: from today (or most recent day) backwards
  let currentStreak = 0;
  if (activeDays.length > 0) {
    const lastDay = activeDays[activeDays.length - 1];
    const daysSinceLast =
      (new Date(today).getTime() - new Date(lastDay).getTime()) /
      (24 * 60 * 60 * 1000);
    if (daysSinceLast <= 1) {
      currentStreak = 1;
      for (let i = activeDays.length - 2; i >= 0; i--) {
        if (isConsecutive(activeDays[i], activeDays[i + 1])) currentStreak++;
        else break;
      }
    }
  }

  return {
    totalActiveDays: activeDays.length,
    longestStreak,
    currentStreak,
    mostActiveProject,
    activityDistribution: distribution,
  };
}

function isConsecutive(prev: string, next: string): boolean {
  const d = new Date(prev);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10) === next;
}

export function getYearRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

const DAYS_PER_VIEW = 364; // 52 weeks
const END_OF_2026 = "2026-12-31";

/** viewOffset 0: 유저 가입주(일요일)부터 2026-12-31까지. -1: 그 이전 52주 */
export function getDateRangeWithView(
  viewOffset: number,
  userCreatedAt?: string | null
): { start: string; end: string; canGoNext: boolean; canGoPrev: boolean } {
  const today = new Date();
  const signup = userCreatedAt ? new Date(userCreatedAt) : null;

  const signupWeekStart = signup
    ? (() => {
        const d = new Date(signup);
        d.setDate(d.getDate() - d.getDay());
        return d;
      })()
    : null;

  let viewStart: Date;
  let viewEnd: Date;

  if (viewOffset === 0) {
    if (signupWeekStart) {
      viewStart = signupWeekStart;
      viewEnd = new Date(END_OF_2026);
      if (today > viewEnd) viewEnd = today;
    } else {
      viewEnd = new Date(END_OF_2026);
      if (today > viewEnd) viewEnd = today;
      viewStart = new Date(viewEnd);
      viewStart.setDate(viewStart.getDate() - DAYS_PER_VIEW);
    }
  } else {
    if (!signupWeekStart) {
      viewEnd = new Date(END_OF_2026);
      if (today > viewEnd) viewEnd = today;
      viewEnd.setDate(viewEnd.getDate() - viewOffset * DAYS_PER_VIEW);
      viewStart = new Date(viewEnd);
      viewStart.setDate(viewStart.getDate() - DAYS_PER_VIEW);
    } else {
      viewEnd = new Date(signupWeekStart);
      viewEnd.setDate(viewEnd.getDate() - 1 + (viewOffset + 1) * DAYS_PER_VIEW);
      viewStart = new Date(viewEnd);
      viewStart.setDate(viewStart.getDate() - DAYS_PER_VIEW);
    }
  }

  const startStr = viewStart.toISOString().slice(0, 10);
  const endStr = viewEnd.toISOString().slice(0, 10);
  const signupStr = signup?.toISOString().slice(0, 10) ?? null;

  const nextPeriodStart = new Date(viewStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() - DAYS_PER_VIEW);
  const nextPeriodStartStr = nextPeriodStart.toISOString().slice(0, 10);
  const canGoPrev = !signupStr || nextPeriodStartStr >= signupStr;
  const canGoNext = viewOffset > 0;

  return {
    start: startStr,
    end: endStr,
    canGoNext,
    canGoPrev,
  };
}

/** 유저 첫 가입일부터 시작 (가입이 1년 넘었으면 1년 전부터) - 기본 view 0 */
export function getDateRange(userCreatedAt?: string | null): { start: string; end: string } {
  const { start, end } = getDateRangeWithView(0, userCreatedAt);
  return { start, end };
}
