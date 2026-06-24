import { Router } from 'express';
import { warehouseController } from '@controllers/warehouse.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/', warehouseController.getAll);
router.get('/:id', warehouseController.getById);
router.get('/:id/locations', warehouseController.getLocations);
router.post('/', authorize('ADMINISTRADOR'), warehouseController.create);
router.post('/:id/locations', authorize('ADMINISTRADOR'), warehouseController.createLocation);
router.put('/:id/locations/:locationId', authorize('ADMINISTRADOR'), warehouseController.updateLocation);
router.delete('/:id/locations/:locationId', authorize('ADMINISTRADOR'), warehouseController.deleteLocation);
router.put('/:id', authorize('ADMINISTRADOR'), warehouseController.update);
router.delete('/:id', authorize('ADMINISTRADOR'), warehouseController.delete);

export default router;