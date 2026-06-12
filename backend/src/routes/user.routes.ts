import { Router } from 'express';
import { userController } from '@controllers/user.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';
import { PERMISSIONS } from '@utils/constants';

const router = Router();

router.use(authenticate);

router.get('/', authorize(...PERMISSIONS.CONFIGURACION), userController.getAll);
router.get('/:id', authorize(...PERMISSIONS.CONFIGURACION), userController.getById);
router.post('/', authorize(...PERMISSIONS.CONFIGURACION), userController.create);
router.put('/:id', authorize(...PERMISSIONS.CONFIGURACION), userController.update);
router.delete('/:id', authorize(...PERMISSIONS.CONFIGURACION), userController.delete);
router.put('/:id/scanner-config', userController.updateScannerConfig);

export default router;