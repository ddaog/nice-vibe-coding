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
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-semibold text-zinc-100 mb-2">
          {tCommon("appName")}
        </h1>
        <p className="text-zinc-400 mb-8">{tCommon("taglineFull")}</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
        >
          {t("signInCta")}
        </Link>
      </div>
    </div>
  );
}
