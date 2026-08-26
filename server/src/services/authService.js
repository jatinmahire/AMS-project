const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const ApiError = require('../utils/ApiError');

async function login(loginId, password) {
  const user = await prisma.user.findUnique({ where: { loginId } });

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid login ID or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid login ID or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, loginId: user.loginId },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      loginId: user.loginId,
      role: user.role,
      fullName: user.fullName,
    },
  };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return {
    id: user.id,
    loginId: user.loginId,
    role: user.role,
    fullName: user.fullName,
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(400, 'Current password is incorrect', { currentPassword: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

module.exports = { login, getProfile, changePassword };
