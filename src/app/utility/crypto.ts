import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { CryptoModule, ISplitKey } from "../types";
import { CryptoStreamError } from "./error";

const KEY_SIZE = 32;
const IV_SIZE = 16;

export class Crypto implements CryptoModule {
  public generateKey(): Buffer {
    return randomBytes(KEY_SIZE);
  }

  public generateIV(): Buffer {
    return randomBytes(IV_SIZE);
  }

  public generateHexKey(): string {
    const key = this.generateKey().toString("hex");
    const iv = this.generateIV().toString("hex");
    return key + iv;
  }

  public splitHexKey(hexString: string): ISplitKey {
    if (hexString.length !== (KEY_SIZE + IV_SIZE) * 2) {
      throw new Error("Invalid key length. The key should include both the 32-byte key and 16-byte IV.");
    }
    const key = hexString.substring(0, KEY_SIZE * 2);
    const iv = hexString.substring(KEY_SIZE * 2);
    return { key, iv };
  }

  public async encryptStream(
    hexKey: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    totalSize: number,
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    try {
      const { key, iv } = this.splitHexKey(hexKey);
      const cipher = createCipheriv("aes-256-cbc", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));

      const chunks: Buffer[] = [];
      let encryptedBytes = 0;
      let { done, value } = await reader.read();

      while (!done) {
        if (value) {
          const encryptedChunk = cipher.update(value);
          chunks.push(encryptedChunk);
          encryptedBytes += value.length;
          onProgress((encryptedBytes / totalSize) * 100);
        }
        ({ done, value } = await reader.read());
      }

      const finalChunk = cipher.final();
      if (finalChunk.length > 0) {
        chunks.push(finalChunk);
      }

      const encryptedData = Buffer.concat(chunks);
      return new Blob([encryptedData]);
    } catch (error) {
      console.error(error);
      throw new CryptoStreamError("Encryption failed. See console for details.");
    } finally {
      reader.releaseLock();
    }
  }

  public async decryptStream(
    hexKey: string,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    totalSize: number,
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    try {
      const { key, iv } = this.splitHexKey(hexKey);
      const decipher = createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));

      const chunks: Buffer[] = [];
      let decryptedBytes = 0;
      let { done, value } = await reader.read();

      while (!done) {
        if (value) {
          const decryptedChunk = decipher.update(value);
          chunks.push(decryptedChunk);
          decryptedBytes += value.length;
          onProgress((decryptedBytes / totalSize) * 100);
        }
        ({ done, value } = await reader.read());
      }

      const finalChunk = decipher.final();
      if (finalChunk.length > 0) {
        chunks.push(finalChunk);
      }

      const decryptedData = Buffer.concat(chunks);
      return new Blob([decryptedData]);
    } catch (error) {
      console.error(error);
      throw new CryptoStreamError("Decryption failed. See console for details.");
    } finally {
      reader.releaseLock();
    }
  }
}
