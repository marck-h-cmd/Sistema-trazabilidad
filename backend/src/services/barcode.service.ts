import bwipjs from 'bwip-js';
import { barcodeConfig } from '@config/barcode';
import { ApiError } from '@utils/errors';

export async function generateBarcode(
  code: string,
  options?: {
    type?: string;
    scale?: number;
    height?: number;
    includeText?: boolean;
  }
): Promise<{ image: Buffer; format: string; code: string }> {
  try {
    const buffer = await (bwipjs.toBuffer({
      bcid: options?.type || barcodeConfig.type,
      text: code,
      scale: options?.scale || barcodeConfig.scale,
      height: options?.height || barcodeConfig.height,
      includetext: options?.includeText ?? true,
      textxalign: 'center',
      backgroundcolor: barcodeConfig.background,
      color: barcodeConfig.color,
    } as any) as Promise<Buffer>);

    return {
      image: buffer,
      format: options?.type || barcodeConfig.type,
      code,
    };
  } catch (error) {
    throw new ApiError(500, 'Error generando código de barras', 'BARCODE_GENERATION_ERROR');
  }
}

export async function generateBarcodeBuffer(code: string): Promise<Buffer> {
  const result = await generateBarcode(code);
  return result.image;
}