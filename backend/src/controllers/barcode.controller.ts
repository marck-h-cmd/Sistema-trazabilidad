import { Request, Response } from 'express';
import { generateBarcode } from '@services/barcode.service';
import { generateQRCode } from '@services/qrcode.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

export class BarcodeController {
  generateBarcode = asyncHandler(async (req: Request, res: Response) => {
    const { code, type, scale, height, includeText } = req.body;
    const result = await generateBarcode(code, { type, scale, height, includeText });
    res.json(formatApiResponse({ ...result, image: result.image.toString('base64') }));
  });

  generateQR = asyncHandler(async (req: Request, res: Response) => {
    const { code, size, errorCorrection } = req.body;
    const result = await generateQRCode(code, { size, errorCorrection });
    res.json(formatApiResponse({
      ...result,
      image: result.image.toString('base64'),
    }));
  });

  scanBarcode = asyncHandler(async (req: Request, res: Response) => {
    const { barcode } = req.body;
    res.json(formatApiResponse({
      code: barcode,
      format: 'code128',
      timestamp: new Date().toISOString(),
    }));
  });
}

export const barcodeController = new BarcodeController();