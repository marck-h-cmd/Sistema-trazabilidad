import { Router } from 'express';
import { barcodeController } from '@controllers/barcode.controller';
import { authenticate } from '@middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/generate', barcodeController.generateBarcode);
router.post('/qr', barcodeController.generateQR);
router.post('/scan', barcodeController.scanBarcode);

export default router;