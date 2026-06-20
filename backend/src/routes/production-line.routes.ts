import { Router } from 'express';
import { productionLineController } from '@controllers/production-line.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', productionLineController.getAll);
router.get('/:id', productionLineController.getById);
router.post('/', authorize('ADMINISTRADOR', 'PRODUCCION'), productionLineController.create);
router.put('/:id', authorize('ADMINISTRADOR', 'PRODUCCION'), productionLineController.update);
router.delete('/:id', authorize('ADMINISTRADOR'), productionLineController.delete);

export default router;
