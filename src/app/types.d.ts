declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BACKEND_HOST: string;
      NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY: string;
      NEXT_PUBLIC_MAX_FILE_SIZE: string;
      NEXT_PUBLIC_ENFORCE_BLOCK_UNSUPPORTED_BROWSER: string;
      NEXT_PUBLIC_CURRENT_GIT_SHA: string;
      NEXT_PUBLIC_CURRENT_GIT_BRANCH: string;
    }
  }
}

export abstract class CryptoModule {
  public generateKey(): Buffer;
  public generateIV(): Buffer;
  public generateHexKey(): string;
  public splitHexKey(hexStr: string): ISplitKey;
  public async encryptStream(
    hexKey: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    totalSize: number,
    onProgress: (progress: number) => void
  ): Promise<Blob>;
  public async decryptStream(
    hexKey: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    totalSize: number,
    onProgress: (progress: number) => void
  ): Promise<Blob>;
}

export abstract class UtilityModule {
  public shortenFileName(fileName: string, maxLength: number): string;
  public copyClipboard(text: string): void;
  public formatBytes(bytes: number): string;
  public splitIdentifier(id: string): ISplitIdentifier | null;
  public getPreferredLanguage(value: string): string;
}

export interface IUserAgent {
  isMobile: () => boolean;
  isDesktop: () => boolean;
  isAndroid: () => boolean;
  isIos: () => boolean;
  isSSR: () => boolean;
  isSafari: () => boolean;
}

export interface IBrowserDetection {
  unsupportedBrowser: boolean;
}

export interface IErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export interface ILocale {
  code: string;
  name: string;
}

export interface ICount {
  count: number;
}

export interface ILinkPageParams {
  id: string;
}

export interface IMimeTypeIconProps {
  type: string;
}

export interface FileUploadForm {
  file: File[];
  use_merge: boolean;
  count: string;
}

export interface FileDownloadForm {
  identifier: string;
  key: string;
}

export interface ISplitKey {
  key: string;
  iv: string;
}

export interface ISplitIdentifier {
  key: string;
  identifier: string;
}

export interface IMessage {
  message: string;
}

export interface UploadResponse extends IMessage {
  identifier: string;
}

export interface GlobalStatusResponse {
  fileCount: number;
  cleanupQueue: number;
}

export interface FileDetails {
  upload_at: number;
  original_filename: string;
  size: number;
  mime_type: string;
}
