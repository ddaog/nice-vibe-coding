"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { GitHubRepo } from "@/types";

export async function getGitHubImportReposFromPending(): Promise<
  { repos: GitHubRepo[] } | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No repos in cookie" };

  const { data: row, error } = await supabase
    .from("github_import_pending")
    .select("repos")
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    console.log("[getGitHubImportReposFromPending] No pending repos for user");
    return { error: "No repos in cookie" };
  }

  const repos = row.repos as GitHubRepo[];
  await supabase.from("github_import_pending").delete().eq("user_id", user.id);
  console.log("[getGitHubImportReposFromPending] Found", repos.length, "repos");
  return { repos };
}

export async function fetchGitHubRepos(): Promise<
  { repos: GitHubRepo[] } | { error: string }
> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Not authenticated" };
  }

  const providerToken = session.provider_token;
  const provider = session.user?.app_metadata?.provider;

  if (provider !== "github" || !providerToken) {
    return {
      error: "GITHUB_REQUIRED",
    };
  }

  try {
    const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${providerToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { error: "GITHUB_REQUIRED" };
      }
      return { error: "Failed to fetch repositories" };
    }

    const data = await res.json();
    const repos: GitHubRepo[] = data.map((r: { id: number; name: string; full_name: string; description: string | null; html_url: string; private: boolean }) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      private: r.private,
    }));

    return { repos };
  } catch {
    return { error: "Failed to fetch repositories" };
  }
}

export async function importReposFromGitHub(
  repoIds: number[],
  repos: GitHubRepo[]
): Promise<{ imported: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, error: "Not authenticated" };

  const toImport = repos.filter((r) => repoIds.includes(r.id));
  const { data: existing } = await supabase
    .from("projects_nvc")
    .select("github_repo_id")
    .eq("user_id", user.id);

  const existingIds = new Set(
    (existing ?? []).map((p) => p.github_repo_id).filter((id): id is number => id != null)
  );

  let imported = 0;
  for (const repo of toImport) {
    if (existingIds.has(repo.id)) continue;
    const { error } = await supabase.from("projects_nvc").insert({
      user_id: user.id,
      title: repo.name,
      description: repo.description ?? null,
      status: "building",
      github_repo_id: repo.id,
    });
    if (!error) {
      existingIds.add(repo.id);
      imported++;
    }
  }

  revalidatePath("/dashboard");
  return { imported };
}
