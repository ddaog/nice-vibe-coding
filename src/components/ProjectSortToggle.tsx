"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function ProjectSortToggle({ sort }: { sort?: string }) {
  const t = useTranslations("dashboard");
  const tProjectCard = useTranslations("projectCard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isIce = sort === "ice";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isIce) {
      params.delete("sort");
    } else {
      params.set("sort", "ice");
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={tProjectCard("iceTooltip")}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isIce
          ? "bg-emerald-600/80 text-white"
          : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50"
      }`}
    >
      {t("sortByIce")}
    </button>
  );
}
