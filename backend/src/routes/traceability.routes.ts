import { Router } from 'express';
import { traceabilityController } from '@controllers/traceability.controller';
import { authenticate } from '@middleware/auth';

const router = Router();

router.get('/public/:codigo', traceabilityController.getPublic);

router.use(authenticate);

router.get('/:codigo', traceabilityController.getByCode);
router.get('/:codigo/backward', traceabilityController.getBackward);
router.get('/:codigo/forward', traceabilityController.getForward);

export default router;