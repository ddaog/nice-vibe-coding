import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjects, type ProjectSort } from "@/lib/actions/projects";
import { getActivities, getActivityStatsByProject } from "@/lib/actions/activities";
import {
  computeDayActivities,
  computeStats,
  getDateRangeWithView,
} from "@/lib/stats";
import { getTranslations } from "next-intl/server";
import { HeatmapSection } from "@/components/HeatmapSection";
import { HeatmapNav } from "@/components/HeatmapNav";
import { ScrollToLogForm } from "@/components/ScrollToLogForm";
import { LogActivityForm } from "@/components/LogActivityForm";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { ProjectCard } from "@/components/ProjectCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ImportFromGitHub } from "@/components/ImportFromGitHub";
import { ProjectSortToggle } from "@/components/ProjectSortToggle";
import { ProjectFilterSelect } from "@/components/ProjectFilterSelect";
import { ProjectViewToggle } from "@/components/ProjectViewToggle";
import { DashboardFilterSync } from "@/components/DashboardFilterSync";
import { ActivityListToggle } from "@/components/ActivityListToggle";
import { ActivityListSection } from "@/components/ActivityListSection";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ github_import?: string; sort?: string; date?: string; view?: string; project?: string; projectFilter?: string; type?: string; layout?: string; activityList?: string }>;
}) {
  const params = await searchParams;
  const initialDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : undefined;
  const initialProjectId = params.project ?? undefined;
  const validTypes = ["dev", "marketing", "monetization", "analytics", "planning"] as const;
  const initialType = params.type && validTypes.includes(params.type as (typeof validTypes)[number])
    ? (params.type as (typeof validTypes)[number])
    : undefined;
  const viewOffset = parseInt(params.view ?? "0", 10) || 0;
  const sortParam = (params.sort === "ice" || params.sort === "recent" || params.sort === "active")
    ? params.sort
    : "ice";
  const projectFilter = params.projectFilter ?? undefined;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const tLog = await getTranslations("logActivity");

  const [activities, activityStats] = await Promise.all([
    getActivities(),
    getActivityStatsByProject(),
  ]);
  const projects = await getProjects(sortParam as ProjectSort, activityStats);

  const { start, end, canGoPrev, canGoNext } = getDateRangeWithView(viewOffset, user?.created_at);
  const filteredActivities = activities.filter((a) => {
    if (a.date < start || a.date > end) return false;
    if (projectFilter) return a.project_id === projectFilter;
    return true;
  });
  const dayMap = computeDayActivities(filteredActivities);
  const projectTitles: Record<string, string> = Object.fromEntries(
    projects.map((p) => [p.id, p.title])
  );
  const stats = computeStats(filteredActivities, projectTitles);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardFilterSync />
      {(initialDate || initialProjectId) && <ScrollToLogForm trigger={initialDate ?? initialProjectId ?? ""} />}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-10 bg-zinc-950/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-zinc-100">
            {tCommon("appName")}
          </Link>
          <nav className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link
              href="/share"
              className="text-sm text-zinc-400 hover:text-zinc-300"
            >
              {tCommon("share")}
            </Link>
            <Link
              href="/share?screenshot=1"
              className="text-sm text-zinc-500 hover:text-zinc-400"
              target="_blank"
            >
              {tCommon("screenshotView")}
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-zinc-400 hover:text-zinc-300"
              >
                {tCommon("signOut")}
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10 overflow-visible">
        <section>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">
            {t("stats")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <p className="text-2xl font-bold text-emerald-400">
                {stats.totalActiveDays}
              </p>
              <p className="text-sm text-zinc-400">{t("activeDays")}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <p className="text-2xl font-bold text-emerald-400">
                {stats.currentStreak}
              </p>
              <p className="text-sm text-zinc-400">{t("currentStreak")}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <p className="text-2xl font-bold text-emerald-400">
                {stats.longestStreak}
              </p>
              <p className="text-sm text-zinc-400">{t("longestStreak")}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <p className="text-sm font-medium text-zinc-300 truncate">
                {stats.mostActiveProject ?? "—"}
              </p>
              <p className="text-sm text-zinc-400">{t("mostActiveProject")}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-zinc-100">
              {t("contributionGraph")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <ActivityListToggle showList={params.activityList === "1"} />
              <ProjectFilterSelect
                projects={projects}
                projectTitles={projectTitles}
                selectedId={projectFilter}
                otherParams={[
                  sortParam !== "recent" && `sort=${sortParam}`,
                  initialDate && `date=${initialDate}`,
                  params.activityList === "1" && "activityList=1",
                ].filter(Boolean).join("&")}
              />
              <HeatmapNav
                viewOffset={viewOffset}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                startDate={start}
                endDate={end}
                otherParams={[
                  sortParam !== "recent" && `sort=${sortParam}`,
                  initialDate && `date=${initialDate}`,
                  projectFilter && `projectFilter=${projectFilter}`,
                  params.activityList === "1" && "activityList=1",
                ].filter(Boolean).join("&")}
              />
            </div>
          </div>
          <HeatmapSection
            dayActivities={Object.fromEntries(dayMap)}
            activities={filteredActivities}
            projectTitles={projectTitles}
            startDate={start}
            endDate={end}
          />
          {params.activityList === "1" && (
            <ActivityListSection
              activities={filteredActivities}
              projectTitles={projectTitles}
            />
          )}
        </section>

        <section id="log-activity">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">
            {t("logActivity")}
          </h2>
          <LogActivityForm projects={projects} initialDate={initialDate} initialProjectId={initialProjectId} initialType={initialType} />
        </section>

        <section className="relative z-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-20">
            <h2 className="text-xl font-semibold text-zinc-100">
              {t("projects")}
            </h2>
            <div className="flex items-center gap-2">
              <ProjectViewToggle layout={params.layout} />
              <ProjectSortToggle sort={params.sort} />
              <ImportFromGitHub initialGitHubImport={params.github_import === "1"} />
            </div>
          </div>
          <div
            className={
              params.layout === "list"
                ? "flex flex-col gap-4 overflow-visible"
                : "grid gap-4 sm:grid-cols-2 overflow-visible"
            }
          >
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                activities={activities.filter((a) => a.project_id === p.id)}
              />
            ))}
            <CreateProjectForm />
          </div>
        </section>

        {Object.values(stats.activityDistribution).some((v) => v > 0) && (
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">
              {t("activityDistribution")}
            </h2>
            <div className="flex flex-wrap gap-4">
              {(
                Object.entries(stats.activityDistribution) as [
                  keyof typeof stats.activityDistribution,
                  number,
                ][]
              )              .map(([type, pct]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">
                    {tLog(type)}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
