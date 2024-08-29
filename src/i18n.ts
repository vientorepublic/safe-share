import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { fallback, locales } from "./app/locales";

export function getPreferredLanguage(value: string): string {
  try {
    const languages = value.split(",");
    const languageObjects = languages.map((language) => {
      const parts = language.trim().split(";");
      const code = parts[0].split("-")[0];
      const q = parts[1] ? parseFloat(parts[1].split("=")[1]) : 1;
      return { code, q };
    });
    languageObjects.sort((a, b) => b.q - a.q);
    const lang = languageObjects[0].code;
    return lang;
  } catch (err) {
    return fallback;
  }
}

export default getRequestConfig(async () => {
  let locale: string;
  const cookie = cookies();
  const headersList = headers();
  const acceptLanguage = headersList.get("accept-language");
  const detectedLanguage = acceptLanguage ? getPreferredLanguage(acceptLanguage) : fallback;
  locale = (locales.find((e) => e.code === detectedLanguage) && detectedLanguage) || fallback;
  const languageCookie = cookie.get("language");
  if (languageCookie) {
    const value = languageCookie.value;
    locale = (locales.find((e) => e.code === value) && value) || fallback;
  }
  return {
    locale,
    messages: (await import(`@/app/locales/${locale}.json`)).default,
  };
});
