"use client";
import { FileDetails, IErrorResponse, ILinkPageParams } from "@/app/types";
import MimeTypeIcon from "@/app/components/icon.component";
import Spinner from "@/app/components/spinner.component";
import { CryptoStreamError } from "@/app/utility/error";
import useBrowserDetect from "@/app/utility/useragent";
import Alert from "@/app/components/alert.component";
import { useEffect, useRef, useState } from "react";
import { BrowserStore } from "@/app/store/browser";
import { useReCaptcha } from "next-recaptcha-v3";
import { fetcher } from "@/app/utility/fetcher";
import { Crypto } from "@/app/utility/crypto";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { fallback } from "@/app/locales";
import { Utility } from "@/app/utility";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";

dayjs.extend(utc);
const crypto = new Crypto();
const utility = new Utility();

export default function LinkPage({ params }: { params: ILinkPageParams }) {
  const { id } = params;
  const t = useTranslations();
  const lang = getCookie("language") || fallback;
  const browserDetection = useBrowserDetect();
  const isSafari = browserDetection.isSafari();
  const { unsupportedBrowser } = BrowserStore();
  const abortController = useRef<AbortController>(new AbortController());
  const [identifier, setIdentifier] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(true);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [size, setSize] = useState<number>(0);
  const [uploadAt, setUploadAt] = useState<number>(0);
  const [key, setKey] = useState<string>("");
  const { executeRecaptcha } = useReCaptcha();

  useEffect(() => {
    async function getFileDetails(): Promise<void> {
      try {
        const decode = utility.splitIdentifier(id);
        if (!decode) {
          setFetchError("Identifier format is invalid.");
          return;
        }
        setIdentifier(decode.identifier);
        setKey(decode.key);
        const params = new URLSearchParams();
        params.append("identifier", decode.identifier);
        params.append("lang", lang);
        const result = await fetcher.get<FileDetails>("/details", {
          params,
        });
        setFileName(result.data.original_filename);
        setMimeType(result.data.mime_type);
        setUploadAt(result.data.upload_at);
        setSize(result.data.size);
        setFetching(false);
      } catch (err) {
        if (isAxiosError(err)) {
          if (err.response) {
            setFetchError(err.response.data.message);
          }
        }
      }
    }
    getFileDetails();
  }, [lang, id]);

  const decryptProgressCallback = (progress: number): void => {
    if (!isSafari) setDecryptProgress(progress);
  };

  async function download(identifier: string, key: string): Promise<void> {
    try {
      setDownloading(true);
      const token = await executeRecaptcha("upload");
      const params = new URLSearchParams();
      params.append("lang", lang);
      const result = await fetcher.post(
        "/download",
        {
          identifier,
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
      const decryptedBlob = await crypto.decryptStream(key, stream, contentLength, decryptProgressCallback);
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
        // Decryption Error
        toast.error(err.message);
      } else if (isAxiosError(err)) {
        // Axios Error
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
        // Abort Controller
        if (err.name === "AbortError" || err.message === "Failed to fetch") {
          toast("Download was canceled");
        }
      } else {
        // Unknown
        console.error(err);
        toast.error("An unknown error occurred. Please check your browser console.");
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 items-center justify-center py-48 px-5 mt-20">
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
      <div className="dark:bg-slate-800 bg-gray-200 p-8 rounded-xl text-center">
        <div className="text-9xl" title={mimeType}>
          <MimeTypeIcon type={mimeType} />
        </div>
        {!fetchError ? (
          !fetching ? (
            <>
              <h1 className="text-2xl mt-3" title={fileName}>
                {utility.shortenFileName(fileName, 50)}
              </h1>
              <p className="text-base text-gray-500">
                {utility.formatBytes(size)}, Upload at UTC {dayjs(uploadAt).utc().format("YYYY-MM-DD HH:mm:ss")}
              </p>
            </>
          ) : (
            <div className="mt-3">
              <div role="status" className="max-w-sm animate-pulse">
                <div className="h-8 rounded-full bg-gray-300 dark:bg-gray-700 w-64"></div>
                <div className="h-4 rounded-full bg-gray-300 dark:bg-gray-700 w-64 mt-2"></div>
              </div>
            </div>
          )
        ) : (
          <p className="text-orange-500 mt-3">{fetchError}</p>
        )}
        <button
          className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-700 font-medium rounded-lg text-sm px-4 py-3 mt-4 w-full text-center"
          onClick={() => download(identifier, key)}
          disabled={fetching || downloading || unsupportedBrowser}
        >
          {downloading && (
            <div className="absolute">
              <Spinner />
            </div>
          )}
          {downloading ? (decrypting ? (!isSafari ? `${decryptProgress.toFixed(2)}%` : "Downloading...") : t("WAITING_FOR_RESPONSE")) : t("DOWNLOAD")}
        </button>
        {downloading && (
          <button
            className="text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-red-700 font-medium rounded-lg text-sm px-4 py-3 mt-4 w-full text-center"
            onClick={() => abortController.current.abort()}
          >
            {t("ABORT")}
          </button>
        )}
      </div>
    </section>
  );
}
