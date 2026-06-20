import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import supplierRoutes from './supplier.routes';
import customerRoutes from './customer.routes';
import warehouseRoutes from './warehouse.routes';
import receptionRoutes from './reception.routes';
import productionRoutes from './production.routes';
import inventoryRoutes from './inventory.routes';
import shipmentRoutes from './shipment.routes';
import traceabilityRoutes from './traceability.routes';
import alertRoutes from './alert.routes';
import reportRoutes from './report.routes';
import barcodeRoutes from './barcode.routes';
import labelRoutes from './label.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Autenticación y Usuarios
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Catálogos
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);
router.use('/warehouses', warehouseRoutes);

// Operaciones
router.use('/receptions', receptionRoutes);
router.use('/productions', productionRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/shipments', shipmentRoutes);

// Trazabilidad y Control
router.use('/traceability', traceabilityRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);

// Utilidades
router.use('/barcodes', barcodeRoutes);
router.use('/labels', labelRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/lineas-produccion', require('./production-line.routes').default);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

export default router;