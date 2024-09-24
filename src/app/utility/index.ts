import { ISplitIdentifier, UtilityModule } from "../types";
import { fallback } from "../locales";
import toast from "react-hot-toast";

export class Utility implements UtilityModule {
  public shortenFileName(fileName: string, maxLength: number): string {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const extIndex = fileName.lastIndexOf(".");
    const namePart = fileName.substring(0, extIndex);
    const ext = fileName.substring(extIndex);
    const shortenedName = namePart.slice(0, maxLength - 4) + "...";
    return shortenedName + ext;
  }

  public async copyClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch (e) {}
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return "0Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + sizes[i];
  }

  public splitIdentifier(id: string): ISplitIdentifier | null {
    const decode = Buffer.from(id, "base64").toString("utf-8").split(":");
    if (decode.length !== 2) {
      return null;
    }
    return {
      key: decode[0],
      identifier: decode[1].substring(0, 36),
    };
  }

  public getPreferredLanguage(value: string): string {
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
}
