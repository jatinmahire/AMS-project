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
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 10 minutes.' },
});

// Login has its own escalating limiter instead of the flat one above: 7 attempts, then a
// 5-minute lock; every cycle after that first one is 5 attempts, then a 10-minute lock.
// express-rate-limit only does a single fixed window, so this tracks state per IP itself.
const loginAttempts = new Map();

function loginRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  let state = loginAttempts.get(ip);

  if (state?.blockUntil && now < state.blockUntil) {
    const minutes = Math.ceil((state.blockUntil - now) / 60000);
    return res.status(429).json({ message: `Too many login attempts. Please try again in ${minutes} minute(s).` });
  }

  if (!state) {
    state = { attempts: 0, blockUntil: null, usedFirstCycle: false };
  } else if (state.blockUntil && now >= state.blockUntil) {
    // Previous lock just expired — start the next cycle (5 attempts / 10-minute lock).
    state = { attempts: 0, blockUntil: null, usedFirstCycle: true };
  }

  const limit = state.usedFirstCycle ? 5 : 7;
  const blockMinutes = state.usedFirstCycle ? 10 : 5;
  state.attempts += 1;

  if (state.attempts > limit) {
    state.blockUntil = now + blockMinutes * 60 * 1000;
    loginAttempts.set(ip, state);
    return res.status(429).json({ message: `Too many login attempts. Please try again in ${blockMinutes} minutes.` });
  }

  loginAttempts.set(ip, state);
  next();
}

router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, requireRole('ADMIN'), validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, authLimiter, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
