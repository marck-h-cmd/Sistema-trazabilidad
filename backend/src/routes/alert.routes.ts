import { Router } from 'express';
import { alertController } from '@controllers/alert.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', alertController.getAll);
router.get('/active', alertController.getActive);
router.get('/:id', alertController.getById);
router.post('/', authorize('ADMINISTRADOR', 'CALIDAD'), alertController.create);
router.get('/:id/impact', authorize('ADMINISTRADOR', 'CALIDAD'), alertController.analyzeImpact);
router.post('/:id/activate', authorize('ADMINISTRADOR', 'CALIDAD'), alertController.activate);
router.post('/:id/resolve', authorize('ADMINISTRADOR', 'CALIDAD'), alertController.resolve);
router.post('/:id/close', authorize('ADMINISTRADOR', 'CALIDAD'), alertController.close);
router.put('/:id/recovery', authorize('ADMINISTRADOR', 'CALIDAD'), alertController.updateRecovery);

export default router;