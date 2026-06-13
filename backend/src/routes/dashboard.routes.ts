import { Router } from 'express';
import { dashboardController } from '@controllers/dashboard.controller';
import { authenticate } from '@middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/kpis', dashboardController.getKPIs);
router.get('/activity', dashboardController.getActivity);

export default router;