/**
 * TypeScript type declarations for qrcode library
 * Provides type safety for QR code generation functions
 */

declare module "qrcode" {
  export interface QRCodeToDataURLOptions {
    margin?: number;
    scale?: number;
    type?: "image/png" | "image/jpeg" | "image/webp" | "text/plain";
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    quality?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export interface QRCodeToBufferOptions extends QRCodeToDataURLOptions {
    rendererOpts?: {
      deflateLevel?: number;
      deflateStrategy?: number;
    };
  }

  export function toDataURL(
    data: string | Buffer,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  export function toBuffer(
    data: string | Buffer,
    options?: QRCodeToBufferOptions
  ): Promise<Buffer>;

  export function toString(
    data: string | Buffer,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  export function toFile(
    path: string,
    data: string | Buffer,
    options?: QRCodeToBufferOptions
  ): Promise<void>;

  export class QRCode {
    constructor(options?: any);
    makeCode(data: string): void;
    addData(data: string, mode?: string): void;
    render(): void;
    getRawData(moduleCount: number): any;
  }
}
