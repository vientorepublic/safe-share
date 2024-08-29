"use client";
import { faCopy, faLock, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileUploadForm, UploadResponse } from "../types";
import InfoComponent from "../components/info.component";
import Spinner from "../components/spinner.component";
import { CryptoStreamError } from "../utility/error";
import { useEffect, useRef, useState } from "react";
import Alert from "../components/alert.component";
import { useReCaptcha } from "next-recaptcha-v3";
import { BrowserStore } from "../store/browser";
import axios, { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { Crypto } from "../utility/crypto";
import { count } from "../enum/count.enum";
import { useForm } from "react-hook-form";
import { getCookie } from "cookies-next";
import { fallback } from "../locales";
import { Utility } from "../utility";
import toast from "react-hot-toast";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";

dayjs.extend(utc);
const crypto = new Crypto();
const utility = new Utility();

const period = 86400000;
const sizeLimit = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 10485760;

export default function UploadPage() {
  const t = useTranslations();
  const lang = getCookie("language") || fallback;
  const { unsupportedBrowser } = BrowserStore();
  const abortController = useRef<AbortController>(new AbortController());
  const { register, handleSubmit } = useForm<FileUploadForm>();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [encryptProgress, setEncryptProgress] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [useMerge, setUseMerge] = useState<boolean>(false);
  const [link, setLink] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const { executeRecaptcha } = useReCaptcha();

  function initializeKey(): void {
    const key = crypto.generateHexKey();
    setGeneratedKey(key);
  }

  function generateKey(): void {
    const key = crypto.generateHexKey();
    setGeneratedKey(key);
    toast.success("The encryption key has been regenerated.");
  }

  function getExpireTime(): string {
    const now = dayjs().valueOf();
    return dayjs(now + period)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
  }

  useEffect(() => {
    // Initialize Encryption Key
    initializeKey();
  }, []);

  function initStates(): void {
    setResult("");
    setExpiresAt("");
    setUploadProgress(0);
  }

  const encryptProgressCallback = (progress: number): void => {
    setEncryptProgress(progress);
  };

  async function upload(data: FileUploadForm): Promise<void> {
    try {
      initStates();
      const file = data.file[0];

      if (file.size === 0) {
        toast.error("The file size cannot be 0 bytes.");
        return;
      }

      if (file.size > sizeLimit) {
        toast.error(`File size cannot exceed ${utility.formatBytes(sizeLimit)}.`);
        return;
      }

      setProcessing(true);
      const token = await executeRecaptcha("upload");
      const params = new URLSearchParams();
      params.append("name", encodeURIComponent(file.name));
      params.append("lang", lang);
      if (data.count !== "no_limit") {
        params.append("count", data.count);
      }
      const stream = file.stream();
      const reader = stream.getReader();
      const encrypted = await crypto.encryptStream(generatedKey, reader, file.size, encryptProgressCallback);
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", encrypted);
      formData.append("g_recaptcha_response", token);
      const http = axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST || "",
      });
      const result = await http.post<UploadResponse>("/upload", formData, {
        params,
        signal: abortController.current.signal,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          const { loaded, total } = event;
          if (total) {
            const progress = Math.round((loaded / total) * 100);
            console.debug("[Progress]", `${progress}%`);
            setUploadProgress(progress);
          }
        },
      });
      const identifier = result.data.identifier;
      if (data.use_merge) {
        const merged = Buffer.from([generatedKey, identifier].join(":"), "utf-8").toString("base64");
        setLink(`${window.location.origin}/link/${merged}`);
        setUseMerge(true);
      }
      setResult(identifier);
      setExpiresAt(getExpireTime());
      toast.success(result.data.message);
    } catch (err) {
      if (err instanceof CryptoStreamError) {
        toast.error(err.message);
      } else if (isAxiosError(err)) {
        if (axios.isCancel(err)) {
          toast("Upload was canceled");
        }
        if (err.response) {
          toast.error(err.response.data.message);
        }
      } else {
        console.error(err);
        toast.error("An unknown error occurred. Please check your browser console.");
      }
    } finally {
      setIsUploading(false);
      setProcessing(false);
    }
  }

  return (
    <section className="flex flex-col gap-10 items-center justify-center py-48">
      {!unsupportedBrowser ? (
        <div className="px-5 text-center">
          <p>{t("GENERATE_WHEN_PAGE_LOAD")}</p>
          <button
            className="text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-green-700 font-medium rounded-lg text-sm px-4 py-2 mt-3 text-center"
            onClick={() => generateKey()}
          >
            {t("RE_GENERATE_KEY")}
          </button>
        </div>
      ) : (
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
            <FontAwesomeIcon icon={faUpload} className="mr-2" />
            {t("SELECT_FILE")}
          </div>
          <form onSubmit={handleSubmit(upload)} className="flex flex-col gap-4">
            <p className="text-gray-500">
              {t("MAX_FILE_SIZE")}: {utility.formatBytes(sizeLimit)}
            </p>
            <input
              type="file"
              {...register("file")}
              disabled={processing || unsupportedBrowser}
              required
              className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 file:bg-gray-50 file:border-0 file:me-4 file:py-3 file:px-4 dark:file:bg-neutral-700 dark:file:text-neutral-200"
            />
            <p>{t("LIMIT_DOWNLOAD_COUNT")}</p>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              defaultValue="no_limit"
              disabled={processing || unsupportedBrowser}
              {...register("count")}
            >
              <option value="no_limit">{t("NO_LIMIT")}</option>
              {count.map((e, i) => {
                return (
                  <option value={e.count} key={i}>
                    {e.count}
                  </option>
                );
              })}
            </select>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("use_merge")} disabled={processing || unsupportedBrowser} defaultChecked className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{t("MERGE_KEY")}</span>
            </label>
            <button
              type="submit"
              className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-700 font-medium rounded-lg text-sm px-4 py-2 text-center"
              disabled={processing || unsupportedBrowser}
            >
              {processing && (
                <div className="absolute">
                  <Spinner />
                </div>
              )}
              {t("UPLOAD")}
            </button>
          </form>
        </div>
        <div className="dark:bg-slate-800 bg-gray-200 p-8 rounded-xl max-w-96">
          <div className="text-xl font-bold mb-3">
            <FontAwesomeIcon icon={faLock} className="mr-2" />
            {t("UPLOAD_RESULT")}
          </div>
          {processing ? (
            <>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-white">Encrypting...</span>
                <span className="text-sm font-medium text-gray-700 dark:text-white">{encryptProgress.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${encryptProgress.toFixed(2)}%` }}></div>
              </div>
              {isUploading && (
                <>
                  <div className="flex justify-between mb-1 mt-3">
                    <span className="text-base font-medium text-gray-700 dark:text-white">Uploading...</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <button
                    className="text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-red-700 font-medium rounded-lg text-sm px-4 py-3 mt-4 w-full text-center"
                    onClick={() => abortController.current.abort()}
                  >
                    {t("ABORT")}
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500 mb-5">{t("WAIT_UPLOAD")}</p>
          )}
          {result && (
            <>
              <p className="text-green-500">{t("FILE_UPLOADED")}</p>
              {useMerge ? (
                <>
                  <p className="text-gray-500 mt-3 mb-1">{t("SHARE_LINK")}:</p>
                  <div className="flex flex-row gap-2">
                    <button
                      className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-700 font-medium rounded-lg text-sm px-5 py-2 text-center"
                      onClick={() => utility.copyClipboard(link)}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <div className="bg-gray-100 dark:bg-gray-500 rounded-xl p-3 text-nowrap overflow-x-auto no-scrollbar">
                      {link || <span className="text-gray-300">(Encryption keys are not merged)</span>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>{t("SHARE_INSTRUCTION")}</p>
                  <p className="text-gray-500 mt-3 mb-1">{t("IDENTIFIER")}:</p>
                  <div className="flex flex-row gap-2">
                    <button
                      className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-700 font-medium rounded-lg text-sm px-5 py-2 text-center"
                      onClick={() => utility.copyClipboard(result)}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <div className="bg-gray-100 dark:bg-gray-500 rounded-xl p-3 text-nowrap overflow-x-auto">{result}</div>
                  </div>
                  <p className="text-gray-500 mt-3 mb-1">{t("ENCRYPTION_KEY")}:</p>
                  <div className="flex flex-row gap-2">
                    <button
                      className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-700 font-medium rounded-lg text-sm px-5 py-2 text-center"
                      onClick={() => utility.copyClipboard(generatedKey)}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <div className="bg-gray-100 dark:bg-gray-500 rounded-xl p-3 overflow-x-auto">{generatedKey}</div>
                  </div>
                </>
              )}
              <p className="mt-3">
                {t("EXPIRES_ON")} UTC {expiresAt}
              </p>
            </>
          )}
        </div>
      </div>
      <InfoComponent />
    </section>
  );
}
