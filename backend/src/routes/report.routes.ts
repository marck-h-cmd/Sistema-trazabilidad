import { Router } from 'express';
import { reportController } from '@controllers/report.controller';
import { authenticate } from '@middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stock', reportController.stockReport);
router.get('/expiry', reportController.expiryReport);
router.get('/traceability/:loteId', reportController.traceabilityReport);
router.get('/shipments', reportController.shipmentReport);

export default router;