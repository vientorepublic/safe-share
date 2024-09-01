import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { CryptoStreamError } from "./error";
import { ISplitKey } from "../types";

export class Crypto {
  public generateKey(): Buffer {
    return randomBytes(16);
  }

  public generateIV(): Buffer {
    return randomBytes(8);
  }

  public generateHexKey(): string {
    const key = this.generateKey().toString("hex");
    const iv = this.generateIV().toString("hex");
    return key + iv;
  }

  public splitHexKey(str: string): ISplitKey {
    const key = str.substring(32, 0);
    const iv = str.substring(32);
    return {
      key,
      iv,
    };
  }

  public async encryptStream(
    key: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    totalSize: number,
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    try {
      const split = this.splitHexKey(key);
      const cipher = createCipheriv("aes-256-cbc", split.key, split.iv);
      const chunks: Uint8Array[] = [];
      let totalLength = 0;
      let encryptedLength = 0;
      let { done, value } = await reader.read();
      while (!done && value) {
        const encryptedChunk = cipher.update(value);
        chunks.push(encryptedChunk);
        totalLength += encryptedChunk.length;
        encryptedLength += value.length;
        const progress = (encryptedLength / totalSize) * 100;
        onProgress(progress);
        ({ done, value } = await reader.read());
      }
      const final = cipher.final();
      if (final.length > 0) {
        chunks.push(final);
        totalLength += final.length;
      }
      const encryptedData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        encryptedData.set(chunk, offset);
        offset += chunk.length;
      }
      return new Blob([encryptedData]);
    } catch (err) {
      console.error(err);
      throw new CryptoStreamError("An error occurred during encryption. Check your browser console.");
    } finally {
      reader.releaseLock();
    }
  }

  public async decryptStream(
    key: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    totalBytes: number,
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    try {
      const split = this.splitHexKey(key);
      const decipher = createDecipheriv("aes-256-cbc", split.key, split.iv);
      let processedBytes = 0;
      const decryptedStream = new ReadableStream<Uint8Array>({
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) {
            const final = decipher.final();
            if (final.length > 0) {
              controller.enqueue(new Uint8Array(final));
            }
            controller.close();
            reader.releaseLock();
          } else {
            const decryptedChunk = new Uint8Array(decipher.update(value));
            processedBytes += value.length;
            const progress = (processedBytes / totalBytes) * 100;
            onProgress(progress);
            controller.enqueue(decryptedChunk);
          }
        },
        cancel() {
          reader.releaseLock();
        },
      });
      return new Response(decryptedStream).blob();
    } catch (err) {
      console.error(err);
      reader.releaseLock();
      throw new CryptoStreamError("An error occurred during decryption. Check your browser console.");
    }
  }
}
