"use client";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { fallback, locales } from "../locales";
import { useEffect, useState } from "react";

export default function LanguageComponent() {
  const router = useRouter();
  const languageCookie = getCookie("language");
  const [currentLanguage, setCurrentLanguage] = useState("");
  useEffect(() => {
    if (languageCookie && locales.find((e) => e.code === languageCookie)) {
      setCurrentLanguage(languageCookie);
    }
  }, [languageCookie]);
  function changeLanguage(lang?: string): void {
    if (!lang) return;
    const locale = (locales.find((e) => e.code === lang) && lang) || fallback;
    setCookie("language", locale);
    router.refresh();
  }
  return (
    <form className="max-w-sm mx-auto">
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={(e) => changeLanguage(e.target.value)}
        value={currentLanguage || "none"}
      >
        <option disabled value="none">
          Select your language
        </option>
        {locales.map((e, i) => {
          return (
            <option value={e.code} key={i}>
              {e.name}
            </option>
          );
        })}
      </select>
    </form>
  );
}
