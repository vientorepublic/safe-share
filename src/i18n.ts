import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { fallback, locales } from "./app/locales";
import { Utility } from "./app/utility";

const utility = new Utility();

export default getRequestConfig(async () => {
  let locale: string;
  const cookie = cookies();
  const headersList = headers();
  const acceptLanguage = headersList.get("accept-language");
  const detectedLanguage = acceptLanguage ? utility.getPreferredLanguage(acceptLanguage) : fallback;
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
