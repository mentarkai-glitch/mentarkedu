declare module 'gif.js' {
  export default class GIF {
    constructor(options: {
      workers?: number;
      quality?: number;
      width: number;
      height: number;
      repeat?: number;
    });
    addFrame(canvas: HTMLCanvasElement | ImageData, options?: { delay?: number }): void;
    on(event: string, callback: (blob: Blob) => void): void;
    render(): void;
  }
}

