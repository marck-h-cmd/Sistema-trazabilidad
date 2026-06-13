import { Router } from 'express';
import { supplierController } from '@controllers/supplier.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/code/:codigo', supplierController.getByCode);
router.get('/:id', supplierController.getById);
router.post('/', authorize('ADMINISTRADOR'), supplierController.create);
router.put('/:id', authorize('ADMINISTRADOR'), supplierController.update);
router.delete('/:id', authorize('ADMINISTRADOR'), supplierController.delete);

export default router;