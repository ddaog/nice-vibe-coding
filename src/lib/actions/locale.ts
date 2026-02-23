"use server";

import { cookies } from "next/headers";

const LOCALE_COOKIE = "locale";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function setLocale(locale: string) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}
