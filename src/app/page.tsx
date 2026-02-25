import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(39,39,42,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.4)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        <span className="text-zinc-500 text-sm font-medium tracking-wide">
          {tCommon("tagline")}
        </span>
        <LocaleSwitcher />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-2xl animate-fade-in">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-zinc-100">{tCommon("appName").split(" ").slice(0, 2).join(" ")}</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              {tCommon("appName").split(" ").slice(2).join(" ")}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-lg mx-auto leading-relaxed">
            {tCommon("taglineFull")}
          </p>

          {/* Mini heatmap preview with animation */}
          <div className="mb-12 animate-fade-in">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
              <div className="flex gap-1">
                {Array.from({ length: 52 }).map((_, col) => (
                  <div key={col} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, row) => {
                      const index = col * 7 + row;
                      return (
                        <div
                          key={row}
                          className="w-2 h-2 rounded-sm bg-emerald-500 animate-heatmap-preview-cell"
                          style={{ animationDelay: `${index * 0.04}s` }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 text-center mt-2">
                {t("heatmapPreview")}
              </p>
            </div>
          </div>

          {/* CTA - simple */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              {t("signInCta")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-zinc-600 text-sm">
          {t("footerTagline")}
        </p>
      </footer>
    </div>
  );
}
