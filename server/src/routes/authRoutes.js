const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginSchema, changePasswordSchema } = require('../validators/authValidator');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
