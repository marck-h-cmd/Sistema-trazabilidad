import { Router } from 'express';
import { productController } from '@controllers/product.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/category/:categoria', productController.getByCategory);
router.get('/:id', productController.getById);
router.get('/:id/stock', productController.getStockSummary);
router.post('/', authorize('ADMINISTRADOR', 'CALIDAD'), productController.create);
router.put('/:id', authorize('ADMINISTRADOR', 'CALIDAD'), productController.update);
router.delete('/:id', authorize('ADMINISTRADOR'), productController.delete);

export default router;