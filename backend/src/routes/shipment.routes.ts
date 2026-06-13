import { Router } from 'express';
import { shipmentController } from '@controllers/shipment.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', shipmentController.getAll);
router.get('/recent', shipmentController.getRecent);
router.get('/client/:clienteId', shipmentController.getByClient);
router.get('/:id', shipmentController.getById);
router.post('/', authorize('ADMINISTRADOR', 'CALIDAD', 'DESPACHO'), shipmentController.create);
router.put('/:id/status', authorize('ADMINISTRADOR', 'CALIDAD', 'DESPACHO'), shipmentController.updateStatus);

export default router;