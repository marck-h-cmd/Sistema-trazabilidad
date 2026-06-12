import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validator';
import { loginSchema, registerSchema, changePasswordSchema } from '@utils/validators';
import { authLimiter } from '@middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/register', authenticate, validate(registerSchema), authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;