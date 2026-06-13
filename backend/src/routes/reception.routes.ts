import { Router } from 'express';
import { receptionController } from '@controllers/reception.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', receptionController.getAll);
router.get('/recent', receptionController.getRecent);
router.get('/:id', receptionController.getById);
router.post('/', authorize('ADMINISTRADOR', 'CALIDAD', 'RECEPCION'), receptionController.create);
router.post('/scan', authorize('ADMINISTRADOR', 'CALIDAD', 'RECEPCION'), receptionController.scanBarcode);

export default router;