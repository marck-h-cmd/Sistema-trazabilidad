import { Router } from 'express';
import { customerController } from '@controllers/customer.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', customerController.getAll);
router.get('/code/:codigo', customerController.getByCode);
router.get('/:id', customerController.getById);
router.post('/', authorize('ADMINISTRADOR'), customerController.create);
router.put('/:id', authorize('ADMINISTRADOR'), customerController.update);
router.delete('/:id', authorize('ADMINISTRADOR'), customerController.delete);

export default router;