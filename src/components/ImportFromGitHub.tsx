"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchGitHubRepos, getGitHubImportReposFromPending, importReposFromGitHub } from "@/lib/actions/github";
import { getSiteOrigin } from "@/lib/site-url";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { GitHubRepo } from "@/types";

export function ImportFromGitHub({
  initialGitHubImport = false,
}: {
  initialGitHubImport?: boolean;
}) {
  const t = useTranslations("importGitHub");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  const loadRepos = async (fromCookie: boolean) => {
    setError(null);
    setImported(null);
    setLoading(true);
    const result = fromCookie
      ? await getGitHubImportReposFromPending()
      : await fetchGitHubRepos();
    setLoading(false);

    if ("error" in result) {
      console.log("[ImportFromGitHub] loadRepos:", fromCookie ? "cookie" : "api", "→ error:", result.error);
      if (result.error === "GITHUB_REQUIRED") {
        setError("github_required");
      } else if (fromCookie && result.error !== "No repos in cookie") {
        setError("fetch_failed");
      } else if (!fromCookie) {
        if (result.error === "GITHUB_REQUIRED") {
          setError("github_required");
        } else {
          setError("fetch_failed");
        }
      }
      return result;
    }

    console.log("[ImportFromGitHub] loadRepos:", fromCookie ? "cookie" : "api", "→", result.repos.length, "repos");
    setRepos(result.repos);
    setSelected(new Set());
    return result;
  };

  const handleOpen = async () => {
    setOpen(true);
    await loadRepos(false);
  };

  useEffect(() => {
    if (!initialGitHubImport) return;
    setOpen(true);
    const timeout = setTimeout(() => setLoading(false), 15000);
    loadRepos(true)
      .then((r) => {
        if (r && "repos" in r && r.repos.length > 0) {
          router.replace("/dashboard");
        } else if (r && "error" in r && r.error === "No repos in cookie") {
          loadRepos(false);
        }
      })
      .catch(() => setLoading(false))
      .finally(() => clearTimeout(timeout));
  }, [initialGitHubImport]);

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    const result = await importReposFromGitHub(
      Array.from(selected),
      repos
    );
    setImporting(false);

    if (result.error) {
      setError("import_failed");
      return;
    }

    setImported(result.imported);
    setSelected(new Set());
    if (result.imported > 0) {
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    }
  };

  const handleSignInWithGitHub = async () => {
    const supabase = createClient();
    const origin = getSiteOrigin();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard&github_import=1`,
        scopes: "repo",
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError("fetch_failed");
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setError("fetch_failed");
    }
  };

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(repos.map((r) => r.id)));
  };

  const selectNone = () => {
    setSelected(new Set());
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="px-4 py-2 rounded-lg border border-zinc-600 hover:border-zinc-500 text-zinc-300 text-sm font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        {t("importFromGitHub")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                {t("title")}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {error === "github_required" && (
                <div className="p-4 rounded-lg bg-amber-900/30 border border-amber-800/50 text-amber-200 text-sm mb-4">
                  <p className="mb-3">{t("githubRequired")}</p>
                  <button
                    type="button"
                    onClick={handleSignInWithGitHub}
                    className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm"
                  >
                    {t("signInWithGitHub")}
                  </button>
                </div>
              )}

              {error === "fetch_failed" && (
                <p className="text-red-400 text-sm mb-4">{t("fetchFailed")}</p>
              )}

              {error === "import_failed" && (
                <p className="text-red-400 text-sm mb-4">{t("importFailed")}</p>
              )}

              {imported != null && imported > 0 && (
                <p className="text-emerald-400 text-sm mb-4">
                  {t("imported", { count: imported })}
                </p>
              )}

              {loading && (
                <p className="text-zinc-400 text-sm">{t("loading")}</p>
              )}

              {!loading && repos.length > 0 && !error && (
                <>
                  <div className="flex gap-3 mb-3">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-600/50 transition-colors"
                    >
                      {t("selectAll")}
                    </button>
                    <button
                      type="button"
                      onClick={selectNone}
                      className="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-600/50 transition-colors"
                    >
                      {t("selectNone")}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {repos.map((repo) => (
                      <label
                        key={repo.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(repo.id)}
                          onChange={() => toggle(repo.id)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-100 truncate">
                            {repo.full_name}
                          </p>
                          {repo.description && (
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {repos.length > 0 && !error && (
              <div className="p-4 border-t border-zinc-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={selected.size === 0 || importing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
                >
                  {importing ? t("importing") : t("import", { count: selected.size })}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
