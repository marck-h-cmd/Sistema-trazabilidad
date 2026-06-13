import QRCode from 'qrcode';
import { config } from '@config/app';
import { ApiError } from '@utils/errors';

export async function generateQRCode(
  lotCode: string,
  options?: {
    size?: number;
    errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<{
  image: Buffer;
  dataUrl: string;
  code: string;
  url: string;
}> {
  try {
    const url = `${config.qrCode.baseUrl}/${lotCode}`;
    const size = options?.size || config.qrCode.size;
    const errorCorrection = options?.errorCorrection || config.qrCode.errorCorrection;

    const dataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const image = await QRCode.toBuffer(url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      type: 'png',
    });

    return {
      image,
      dataUrl,
      code: lotCode,
      url,
    };
  } catch (error) {
    throw new ApiError(500, 'Error generando código QR', 'QR_GENERATION_ERROR');
  }
}

export function getQRUrl(lotCode: string): string {
  return `${config.qrCode.baseUrl}/${lotCode}`;
}