export type ProjectStatus = "idea" | "building" | "blocked" | "launched";
export type ActivityType =
  | "dev"
  | "marketing"
  | "monetization"
  | "analytics"
  | "planning";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  github_repo_id?: number | null;
  ice_impact?: number | null;
  ice_confidence?: number | null;
  ice_ease?: number | null;
  status_note?: string | null;
}

/** 5단계 점수: 매우낮음 2, 낮음 4, 보통 6, 높음 8, 매우높음 10 */
export const ICE_VALUES = [2, 4, 6, 8, 10] as const;
export type IceValue = (typeof ICE_VALUES)[number];

/** 평균을 가장 가까운 ICE 값(2,4,6,8,10)으로 반올림 */
export function roundToNearestIceValue(n: number): IceValue {
  const nearest = ICE_VALUES.reduce((prev, curr) =>
    Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
  );
  return nearest;
}

/** ICE 종합점수: (기대수익+확신+난이도)/3, 소수점 한 자리까지 표기 */
export function computeIceScore(p: Project): number | null {
  const i = p.ice_impact ?? 0;
  const c = p.ice_confidence ?? 0;
  const e = p.ice_ease ?? 0;
  if (i === 0 && c === 0 && e === 0) return null;
  const avg = (i + c + e) / 3;
  return Math.round(avg * 10) / 10;
}

/** 2,4,6,8,10 → 매우낮음/낮음/보통/높음/매우높음. Ease는 반대(높을수록 쉬움=낮은 난이도) */
export function scoreToLevel(score: number, invert = false): "veryLow" | "low" | "medium" | "high" | "veryHigh" {
  const s = invert ? 12 - score : score; // 2↔10, 4↔8, 6↔6
  if (s <= 2) return "veryLow";
  if (s <= 4) return "low";
  if (s <= 6) return "medium";
  if (s <= 8) return "high";
  return "veryHigh";
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
}

export interface Activity {
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  type: ActivityType;
  intensity: number;
  note: string | null;
  created_at: string;
}

export interface ActivityWithProject extends Activity {
  projects?: Project | null;
}

export interface DayActivity {
  date: string;
  totalIntensity: number;
  count: number;
  /** 활동 유형별 강도 (날짜당) */
  byType?: Record<ActivityType, number>;
}

export interface UserStats {
  totalActiveDays: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveProject: string | null;
  activityDistribution: Record<ActivityType, number>;
}
