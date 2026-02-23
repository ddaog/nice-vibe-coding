import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["ko", "en", "ja"] as const;
export type Locale = (typeof locales)[number];

const localeMap: Record<string, Locale> = {
  ko: "ko",
  en: "en",
  ja: "ja",
};

function getLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "en";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  return localeMap[preferred ?? ""] ?? "en";
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const headerList = await headers();
  const localeCookie = store.get("locale")?.value;
  const locale: Locale =
    localeCookie && locales.includes(localeCookie as Locale)
      ? (localeCookie as Locale)
      : getLocaleFromHeader(headerList.get("accept-language"));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
