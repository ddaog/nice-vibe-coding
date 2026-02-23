"use client";

import { useLocale } from "next-intl";
import { setLocale } from "@/lib/actions/locale";
import { useRouter } from "next/navigation";

const LOCALES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "ko" | "en" | "ja";
    await setLocale(value);
    router.refresh();
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
    >
      {LOCALES.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
