import { Router } from 'express';
import { inventoryController } from '@controllers/inventory.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

// Movimientos
router.get('/movements', inventoryController.getMovements);
router.get('/movements/recent', inventoryController.getRecent);
router.get('/movements/lot/:lotId', inventoryController.getMovementsByLot);

// Stock
router.get('/stock/lot/:lotId', inventoryController.getStockByLot);
router.get('/stock/location/:locationId', inventoryController.getStockByLocation);
router.get('/expiring', inventoryController.getExpiringSoon);

// FIFO
router.get('/fifo', inventoryController.getFifoSuggestions);
router.post('/fifo/validate', inventoryController.validateFifo);

// Operaciones
router.post('/move', authorize('ADMINISTRADOR', 'ALMACEN'), inventoryController.moveLot);

export default router;