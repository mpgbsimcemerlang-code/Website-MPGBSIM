import html2canvas from 'html2canvas-pro';

/**
 * Converts a base64 JPEG data URL into a Uint8Array of raw JPEG bytes.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes an ASCII string into a Uint8Array.
 */
function strToUint8(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Embeds a rendered HTMLCanvasElement onto a full single A4 portrait page (595.28 x 841.89 pt)
 * and returns a valid PDF 1.4 Blob.
 */
export function canvasToSinglePageA4PdfBlob(canvas: HTMLCanvasElement): Blob {
  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // Fill the full A4 page while preserving exact aspect ratio
  const scale = Math.min(pageWidthPt / imgWidthPx, pageHeightPt / imgHeightPx);
  const drawWidth = Number((imgWidthPx * scale).toFixed(2));
  const drawHeight = Number((imgHeightPx * scale).toFixed(2));

  // Center on the A4 page
  const offsetX = Number(((pageWidthPt - drawWidth) / 2).toFixed(2));
  const offsetY = Number(((pageHeightPt - drawHeight) / 2).toFixed(2));

  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.96);
  const jpegBytes = dataUrlToUint8Array(jpegDataUrl);

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0]; // index 0 is free object
  let currentOffset = 0;

  const pushStr = (s: string) => {
    const arr = strToUint8(s);
    chunks.push(arr);
    currentOffset += arr.length;
  };

  const pushBytes = (arr: Uint8Array) => {
    chunks.push(arr);
    currentOffset += arr.length;
  };

  // PDF Header
  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  offsets[1] = currentOffset;
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages (strictly 1 page)
  offsets[2] = currentOffset;
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page
  offsets[3] = currentOffset;
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im0 4 0 R >> >> /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Contents 5 0 R >>\nendobj\n`
  );

  // Object 4: JPEG Image XObject
  offsets[4] = currentOffset;
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushStr('\nendstream\nendobj\n');

  // Object 5: Page Content Stream
  const contentStream = `q\n${drawWidth} 0 0 ${drawHeight} ${offsetX} ${offsetY} cm\n/Im0 Do\nQ\n`;
  offsets[5] = currentOffset;
  pushStr(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
  );

  // Cross-Reference Table (xref)
  const xrefOffset = currentOffset;
  pushStr('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    const padded = String(offsets[i]).padStart(10, '0');
    pushStr(`${padded} 00000 n \n`);
  }

  // Trailer
  pushStr(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return new Blob(chunks, { type: 'application/pdf' });
}

/**
 * Renders the target DOM element as a full A4 portrait page (794px x 1123px)
 * matching the preview and downloads a single-page A4 PDF.
 */
export async function downloadElementAsSinglePagePdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Exact A4 portrait pixel dimensions at 96 DPI (210mm x 297mm -> 794px x 1123px)
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${A4_WIDTH_PX}px`;
  wrapper.style.minHeight = `${A4_HEIGHT_PX}px`;
  wrapper.style.background = '#ffffff';
  wrapper.style.zIndex = '-1';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.minWidth = `${A4_WIDTH_PX}px`;
  clone.style.maxWidth = `${A4_WIDTH_PX}px`;
  clone.style.minHeight = `${A4_HEIGHT_PX}px`;
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';
  clone.style.boxSizing = 'border-box';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: A4_WIDTH_PX,
      windowWidth: 1024,
    });

    const pdfBlob = canvasToSinglePageA4PdfBlob(canvas);
    const blobUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}
