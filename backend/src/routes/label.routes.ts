import { Router } from 'express';
import { labelController } from '@controllers/label.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/roles';

const router = Router();

router.use(authenticate);

router.post('/print', labelController.generateLabels);
router.get('/templates', labelController.getTemplates);
router.post('/templates', authorize('ADMINISTRADOR'), labelController.createTemplate);
router.put('/templates/:id', authorize('ADMINISTRADOR'), labelController.updateTemplate);
router.delete('/templates/:id', authorize('ADMINISTRADOR'), labelController.deleteTemplate);

export default router;