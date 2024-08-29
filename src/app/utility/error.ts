export class CryptoStreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptoStreamError";
  }
}
