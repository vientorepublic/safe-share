"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FileDownloadForm, IErrorResponse } from "../types";
import InfoComponent from "../components/info.component";
import Spinner from "../components/spinner.component";
import { CryptoStreamError } from "../utility/error";
import Alert from "../components/alert.component";
import { useReCaptcha } from "next-recaptcha-v3";
import { BrowserStore } from "../store/browser";
import { fetcher } from "../utility/fetcher";
import { useTranslations } from "next-intl";
import { Crypto } from "../utility/crypto";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { getCookie } from "cookies-next";
import { fallback } from "../locales";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";

dayjs.extend(utc);
const crypto = new Crypto();

export default function Home() {
  const t = useTranslations();
  const lang = getCookie("language") || fallback;
  const { unsupportedBrowser } = BrowserStore();
  const abortController = useRef<AbortController>(new AbortController());
  const { register, handleSubmit } = useForm<FileDownloadForm>();
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const { executeRecaptcha } = useReCaptcha();

  const decryptProgressCallback = (progress: number): void => {
    setDecryptProgress(progress);
  };

  async function download(data: FileDownloadForm): Promise<void> {
    try {
      setDownloading(true);
      const token = await executeRecaptcha("download");
      const params = new URLSearchParams();
      params.append("lang", lang);
      const result = await fetcher.post(
        "/download",
        {
          identifier: data.identifier,
          g_recaptcha_response: token,
        },
        {
          params,
          responseType: "stream",
          signal: abortController.current.signal,
          onDownloadProgress(event) {
            const { loaded, total } = event;
            if (total) {
              const progress = Math.round((loaded / total) * 100);
              console.debug("[Progress]", `${progress}%`);
            }
          },
        }
      );
      const stream: ReadableStreamDefaultReader<Uint8Array> = result.data.getReader();
      const contentLength = Number(result.headers["content-length"]) || 0;
      if (!contentLength) {
        throw new Error("Content length cannot be 0 bytes.");
      }
      setDecrypting(true);
      const decryptedBlob = await crypto.decryptStream(data.key, stream, contentLength, decryptProgressCallback);
      setDecrypting(false);
      const fileURL = URL.createObjectURL(decryptedBlob);
      const link = document.createElement("a");
      const originalFileName = String(result.headers["content-disposition"]).split("=")[1];
      link.setAttribute("download", decodeURIComponent(originalFileName));
      link.href = fileURL;
      link.click();
      URL.revokeObjectURL(fileURL);
      toast.success("The file has been downloaded.");
    } catch (err) {
      if (err instanceof CryptoStreamError) {
        toast.error(err.message);
      } else if (isAxiosError(err)) {
        if (err.response) {
          const stream: ReadableStreamDefaultReader<Uint8Array> = err.response.data.getReader();
          const { value } = await stream.read();
          if (value) {
            const decodedText = new TextDecoder().decode(value);
            const json: IErrorResponse = JSON.parse(decodedText);
            toast.error(json.message);
          }
        }
      } else if (err instanceof Error) {
        if (err.name === "AbortError" || err.message === "Failed to fetch") {
          toast("Download was canceled");
        }
      } else {
        console.error(err);
        toast.error("An unknown error occurred. Please check your browser console.");
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="flex flex-col gap-10 items-center justify-center py-64">
      {unsupportedBrowser && (
        <Alert>
          Safari browser is currently not supported due to technical issues.
          <br />
          We apologize for any inconvenience caused.
        </Alert>
      )}
      <noscript>
        <Alert>Please enable JavaScript to use this webpage.</Alert>
      </noscript>
      <div className="flex flex-col sm:flex-row gap-5 px-5">
        <div className="dark:bg-slate-800 bg-gray-200 p-8 rounded-xl">
          <div className="text-xl font-bold mb-3">
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            {t("DOWNLOAD")}
          </div>
          <form onSubmit={handleSubmit(download)} className="flex flex-col gap-4">
            <input
              type="text"
              {...register("identifier")}
              disabled={downloading || unsupportedBrowser}
              className="bg-gray-50 disabled:bg-gray-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={t("ENTER_IDENTIFIER")}
              required
            />
            <input
              type="text"
              {...register("key")}
              disabled={downloading || unsupportedBrowser}
              className="bg-gray-50 disabled:bg-gray-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={t("ENTER_DECRYPTION_KEY")}
              required
            />
            <button
              className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-700 font-medium rounded-lg text-sm px-4 py-3 mt-4 w-full text-center"
              type="submit"
              disabled={downloading || unsupportedBrowser}
            >
              {downloading && (
                <div className="absolute">
                  <Spinner />
                </div>
              )}
              {downloading ? (decrypting ? `${decryptProgress.toFixed(2)}%` : t("WAITING_FOR_RESPONSE")) : t("DOWNLOAD")}
            </button>
            {downloading && (
              <button
                className="text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-red-700 font-medium rounded-lg text-sm px-4 py-3 w-full text-center"
                onClick={() => abortController.current.abort()}
              >
                {t("ABORT")}
              </button>
            )}
          </form>
        </div>
      </div>
      <InfoComponent />
    </section>
  );
}
