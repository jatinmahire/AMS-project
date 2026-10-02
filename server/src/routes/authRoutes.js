const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginSchema, changePasswordSchema, updateProfileSchema } = require('../validators/authValidator');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, requireRole('ADMIN'), validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
