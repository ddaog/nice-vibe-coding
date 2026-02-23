import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const githubImport = searchParams.get("github_import") === "1";

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && session) {
      let redirectUrl = `${origin}${next}`;
      let repos: Array<{ id: number; name: string; full_name: string; description: string | null; html_url: string; private: boolean }> | null = null;

      if (githubImport && session.provider_token) {
        try {
          const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          if (res.ok) {
            const data = await res.json();
            repos = data.slice(0, 50).map((r: { id: number; name: string; full_name: string; description: string | null; html_url: string; private: boolean }) => ({
              id: r.id,
              name: r.name,
              full_name: r.full_name,
              description: r.description,
              html_url: r.html_url,
              private: r.private,
            }));
            redirectUrl = `${origin}${next}${next.includes("?") ? "&" : "?"}github_import=1`;

            const { error: upsertErr } = await supabase
              .from("github_import_pending")
              .upsert({ user_id: session.user.id, repos }, { onConflict: "user_id" });
            if (upsertErr) {
              console.error("[auth/callback] DB upsert failed:", upsertErr);
              repos = null;
            } else {
              console.log("[auth/callback] Stored", repos.length, "repos in DB");
            }
          }
        } catch (e) {
          console.error("[auth/callback] GitHub API fetch failed:", e);
        }
      }
      if (githubImport && !repos) {
        console.warn("[auth/callback] github_import=1 but no repos (provider_token?", !!session?.provider_token, ")");
      }

      return NextResponse.redirect(redirectUrl, { status: 302 });
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
