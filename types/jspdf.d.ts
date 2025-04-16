declare module 'jspdf' {
  interface jsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string | number[];
    hotfixes?: string[];
    compression?: boolean;
  }

  class jsPDF {
    constructor(options?: jsPDFOptions);
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: string,
      rotation?: number
    ): jsPDF;
    save(filename?: string): jsPDF;
    output(type?: string, options?: any): any;
    setFontSize(size: number): jsPDF;
    text(text: string, x: number, y: number, options?: any): jsPDF;
    setProperties(properties: any): jsPDF;
    setFillColor(ch1: number, ch2?: number, ch3?: number, ch4?: number): jsPDF;
    rect(x: number, y: number, w: number, h: number, style: string): jsPDF;
  }

  export default jsPDF;
} 