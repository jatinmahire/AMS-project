const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginSchema, changePasswordSchema, updateProfileSchema } = require('../validators/authValidator');

const router = express.Router();

// By IP, not loginId — so a mistyped password can't lock out someone else's account,
// and an attacker can't lock out a real user by deliberately failing their login.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in a few minutes.' },
});

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, requireRole('ADMIN'), validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, authLimiter, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
