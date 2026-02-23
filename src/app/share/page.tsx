import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivities } from "@/lib/actions/activities";
import { getProjects } from "@/lib/actions/projects";
import {
  computeDayActivities,
  computeStats,
  getDateRange,
} from "@/lib/stats";
import { getTranslations } from "next-intl/server";
import { ShareView } from "@/components/ShareView";

const TAGLINE_KEYS = [
  "buildingInPublic",
  "consistency",
  "shipDaily",
  "progress",
] as const;

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ screenshot?: string }>;
}) {
  const { screenshot } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [projects, activities] = await Promise.all([
    getProjects(),
    getActivities(),
  ]);

  const { start, end } = getDateRange(user?.created_at);
  const filteredActivities = activities.filter(
    (a) => a.date >= start && a.date <= end
  );
  const dayMap = computeDayActivities(filteredActivities);
  const projectTitles: Record<string, string> = Object.fromEntries(
    projects.map((p) => [p.id, p.title])
  );
  const stats = computeStats(filteredActivities, projectTitles);

  const tShare = await getTranslations("share.taglines");
  const taglineKey = TAGLINE_KEYS[Math.floor(Math.random() * TAGLINE_KEYS.length)];
  const tagline = tShare(taglineKey);

  const dayActivitiesJson = Object.fromEntries(
    Array.from(dayMap.entries()).map(([k, v]) => [k, v])
  );

  const username =
    user.user_metadata?.full_name ??
    user.user_metadata?.user_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "builder";

  return (
    <ShareView
      username={username}
      stats={stats}
      dayActivities={dayActivitiesJson}
      startDate={start}
      endDate={end}
      tagline={tagline}
      hideNav={screenshot === "1"}
    />
  );
}
