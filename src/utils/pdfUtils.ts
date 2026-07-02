import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Annotation } from '../context/PdfContext';

/**
 * Hex renk kodunu rgb() nesnesine dönüştürür
 */
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return rgb(0, 0, 0);
  return rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  );
}

/**
 * Annotation'ları PDF'e embed ederek yeni bir Uint8Array döner
 */
export async function savePdfWithAnnotations(
  pdfData: Uint8Array,
  annotations: Annotation[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfData);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const ann of annotations) {
    const page = pages[ann.pageIndex];
    if (!page) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();

    switch (ann.type) {
      case 'text': {
        const x = ann.x * pageWidth;
        // PDF koordinat sistemi sol-alttan başlar, bizim y üstten
        const y = pageHeight - (ann.y * pageHeight);
        const fontSize = ann.fontSize ?? 14;
        const color = hexToRgb(ann.color ?? '#000000');

        page.drawText(ann.content ?? '', {
          x,
          y: y - fontSize,
          size: fontSize,
          font,
          color,
        });
        break;
      }

      case 'highlight': {
        const x = ann.x * pageWidth;
        const y = pageHeight - (ann.y * pageHeight);
        const w = (ann.width ?? 0.1) * pageWidth;
        const h = (ann.height ?? 0.02) * pageHeight;
        const color = hexToRgb(ann.highlightColor ?? '#facc15');

        page.drawRectangle({
          x,
          y: y - h,
          width: w,
          height: h,
          color,
          opacity: 0.35,
        });
        break;
      }

      case 'draw': {
        if (!ann.path) break;
        const color = hexToRgb(ann.strokeColor ?? '#ef4444');
        const strokeWidth = ann.strokeWidth ?? 2;

        // SVG path'ini parçalara ayırarak çizgilere dönüştür
        const commands = parseSvgPath(ann.path);
        for (let i = 0; i < commands.length - 1; i++) {
          const from = commands[i];
          const to = commands[i + 1];
          if (from && to) {
            page.drawLine({
              start: {
                x: from.x * pageWidth,
                y: pageHeight - (from.y * pageHeight),
              },
              end: {
                x: to.x * pageWidth,
                y: pageHeight - (to.y * pageHeight),
              },
              thickness: strokeWidth,
              color,
            });
          }
        }
        break;
      }
    }
  }

  const savedBytes = await pdfDoc.save();
  return new Uint8Array(savedBytes);
}

/**
 * Basit SVG path parser — M ve L komutlarını destekler
 */
function parseSvgPath(path: string): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const regex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = regex.exec(path)) !== null) {
    points.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    });
  }
  return points;
}

/**
 * Birden fazla PDF'i tek bir PDF'te birleştirir
 */
export async function mergePdfs(pdfDataArray: Uint8Array[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const pdfData of pdfDataArray) {
    const doc = await PDFDocument.load(pdfData);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    for (const page of pages) {
      mergedDoc.addPage(page);
    }
  }

  const savedBytes = await mergedDoc.save();
  return new Uint8Array(savedBytes);
}

/**
 * PDF'e resim ekler (yeni sayfa olarak)
 */
export async function addImageToPdf(
  pdfData: Uint8Array,
  imageData: Uint8Array,
  imageType: 'png' | 'jpg',
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfData);

  const image = imageType === 'png'
    ? await pdfDoc.embedPng(imageData)
    : await pdfDoc.embedJpg(imageData);

  const dims = image.scale(1);
  const page = pdfDoc.addPage([dims.width, dims.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: dims.width,
    height: dims.height,
  });

  const savedBytes = await pdfDoc.save();
  return new Uint8Array(savedBytes);
}

/**
 * PDF'ten belirli sayfa aralığını çıkarır
 */
export async function extractPageRange(
  pdfData: Uint8Array,
  startPage: number,  // 1-based
  endPage: number,    // 1-based, inclusive
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfData);
  const newDoc = await PDFDocument.create();

  const start = Math.max(0, startPage - 1);
  const end = Math.min(srcDoc.getPageCount() - 1, endPage - 1);
  const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const pages = await newDoc.copyPages(srcDoc, indices);
  for (const page of pages) {
    newDoc.addPage(page);
  }

  const savedBytes = await newDoc.save();
  return new Uint8Array(savedBytes);
}

/**
 * Dosya boyutunu okunabilir formata çevirir
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
