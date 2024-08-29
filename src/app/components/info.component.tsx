"use client";
import { useTranslations } from "next-intl";

export default function InfoComponent() {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 px-5 text-sm">
      <p className="text-gray-500">
        {t("INFO_NOT_COLLECT")}
        <br />
        <b>{t("GENERATE_FROM_BROWSER")}</b>
      </p>
    </div>
  );
}
