declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>;
  export function toCanvas(canvas: HTMLCanvasElement, text: string): Promise<void>;
  export function toString(text: string, options?: any): Promise<string>;
}
