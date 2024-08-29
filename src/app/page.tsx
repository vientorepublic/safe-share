"use client";
import { faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import SecurityOnImage from "@/app/static/images/undraw_security_on.svg";
import SecureLoginImage from "@/app/static/images/undraw_secure_login.svg";
import SecureFilesImage from "@/app/static/images/undraw_secure_files.svg";
import ShareLinkImage from "@/app/static/images/undraw_share_link.svg";
import SelectLanguage from "./components/language.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GlobalStatusResponse } from "./types";
import { useEffect, useState } from "react";
import { fetcher } from "./utility/fetcher";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const t = useTranslations();
  const [fetching, setFetching] = useState(true);
  const [fileCount, setFileCount] = useState(0);
  const [cleanupQueue, setCleanupQueue] = useState(0);
  useEffect(() => {
    async function getGlobalStats(): Promise<void> {
      try {
        const result = await fetcher.get<GlobalStatusResponse>("/status/global");
        setFileCount(result.data.fileCount);
        setCleanupQueue(result.data.cleanupQueue);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    getGlobalStats();
  }, []);
  return (
    <section className="py-20 mt-10 text-center">
      <div className="px-10 mx-auto max-w-7xl">
        <div className="w-full mx-auto text-left py-5 sm:py-20 md:w-11/12 xl:w-9/12 md:text-center">
          <div className="mb-8 text-4xl font-extrabold leading-none tracking-normal md:text-6xl md:tracking-tight">
            <div className="flex sm:flex-row flex-col items-center justify-center">
              <Image src={SecurityOnImage} className="animate-slidein100 opacity-0 py-10" width={400} height={350} alt="" />
              <div className="animate-slidein300 opacity-0 flex flex-col gap-4">
                <h1 className="text-black text-gray-700 dark:text-gray-200">{t("SHARE_YOUR_FILES")}</h1>
                <h1 className="block w-full brand-gradient">{t("MORE_SECURELY")}</h1>
              </div>
            </div>
          </div>
          <div className="animate-slidein500 opacity-0 text-center">
            <p className="px-0 mb-8 text-lg text-gray-600 dark:text-gray-200 md:text-xl lg:px-24">{t("E2EE_SUPPORT")}</p>
            <div className="mb-4 sm:space-x-3 md:space-x-3 md:mb-8">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg text-white bg-green-400 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-600 rounded-2xl sm:w-auto sm:mb-0"
              >
                <FontAwesomeIcon icon={faUpload} className="mr-1" />
                {t("UPLOAD")}
              </Link>
              <Link
                href="/download"
                className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-700 rounded-2xl sm:w-auto sm:mb-0"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-1" />
                {t("DOWNLOAD")}
              </Link>
            </div>
          </div>
        </div>
        <div className="py-20 text-center">
          <h1 className="dark:text-white text-gray text-4xl sm:text-5xl font-bold text-glow">Key Features</h1>
          <div className="flex flex-col sm:flex-row gap-8 items-center justify-center py-10">
            <div className="p-8 max-w-72">
              <Image src={SecureLoginImage} width={400} height={250} className="mb-7" alt="" />
              <div className="text-2xl font-bold mb-3 text-glow">{t("NO_LOG_POLICY")}</div>
              {t("NO_LOG_POLICY_DESCRIPTION")}
            </div>
            <div className="p-8 max-w-72">
              <Image src={SecureFilesImage} width={400} height={250} className="mb-7" alt="" />
              <div className="text-2xl font-bold mb-3 text-glow">{t("E2E_ENCRYPTION")}</div>
              {t("E2E_ENCRYPTION_DESCRIPTION")}
            </div>
            <div className="p-8 max-w-72">
              <Image src={ShareLinkImage} width={400} height={250} className="mb-7" alt="" />
              <div className="text-2xl font-bold mb-3 text-glow">{t("CONVENIENT_SHARING_LINK")}</div>
              {t("CONVENIENT_SHARING_LINK_DESCRIPTION")}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 py-20 text-base">
          <p className="text-2xl">
            {t("ALL_FILES")}: {!fetching ? fileCount.toLocaleString() : "-"}
          </p>
          <p className="text-2xl">
            {t("CLEANUP_QUEUE")}: {!fetching ? cleanupQueue.toLocaleString() : "-"}
          </p>
          <p className="text-gray-500">{t("VALID_FOR_24HR")}</p>
        </div>
        <div className="flex flex-col gap-5 mt-10">
          <h1 className="text-2xl text-glow">Select Your Language</h1>
          <SelectLanguage />
        </div>
      </div>
    </section>
  );
}
