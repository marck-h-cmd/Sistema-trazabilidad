import { Router } from 'express';
import { productionController } from '@controllers/production.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', productionController.getAll);
router.get('/recent', productionController.getRecent);
router.get('/:id', productionController.getById);
router.post('/', authorize('ADMINISTRADOR', 'CALIDAD', 'PRODUCCION'), productionController.create);
router.put('/:id', authorize('ADMINISTRADOR', 'CALIDAD', 'PRODUCCION'), productionController.update);

export default router;