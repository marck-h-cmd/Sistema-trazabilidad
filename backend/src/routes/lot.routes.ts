import { Router } from 'express';
import { lotController } from '@controllers/lot.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', lotController.getAll);
router.get('/available/:productId', lotController.getAvailableByProduct);
router.get('/:id', lotController.getById);

export default router;
