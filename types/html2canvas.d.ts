declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    allowTaint?: boolean;
    useCORS?: boolean;
    logging?: boolean;
    width?: number;
    height?: number;
    backgroundColor?: string;
    foreignObjectRendering?: boolean;
  }

  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;

  export default html2canvas;
} 