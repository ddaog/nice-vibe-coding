"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function ActivityListToggle({ showList }: { showList: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (showList) {
      params.delete("activityList");
    } else {
      params.set("activityList", "1");
    }
    router.replace(`/dashboard?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-zinc-400 hover:text-zinc-300 underline underline-offset-2"
    >
      {showList ? t("closeList") : t("viewActivityList")}
    </button>
  );
}
