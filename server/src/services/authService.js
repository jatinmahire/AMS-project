const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const ApiError = require('../utils/ApiError');

async function assignedContractor(user) {
  if (user.role === 'CONTRACTOR' && user.contractorId) {
    return prisma.contractor.findUnique({ where: { id: user.contractorId }, select: { id: true, contractorName: true } });
  }
  if (user.role === 'SUPERVISOR' && user.supervisorId) {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: user.supervisorId },
      include: { assignedContractor: { select: { id: true, contractorName: true } } },
    });
    return supervisor?.assignedContractor || null;
  }
  return null;
}

const SELECTED_ROLE_LABELS = { ADMIN: 'Admin', SUPERVISOR: 'Supervisor', CONTRACTOR: 'Contractor' };

async function login(loginId, password, selectedRole) {
  const user = await prisma.user.findUnique({ where: { loginId } });

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid login ID or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid login ID or password');
  }

  if (user.role !== selectedRole) {
    throw new ApiError(401, `This ID is not registered as a ${SELECTED_ROLE_LABELS[selectedRole]}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, loginId: user.loginId, supervisorId: user.supervisorId, contractorId: user.contractorId },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  const contractor = await assignedContractor(user);

  return {
    token,
    user: {
      id: user.id,
      loginId: user.loginId,
      role: user.role,
      fullName: user.fullName,
      supervisorId: user.supervisorId,
      assignedContractorId: contractor?.id || null,
      assignedContractorName: contractor?.contractorName || null,
    },
  };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const contractor = await assignedContractor(user);

  return {
    id: user.id,
    loginId: user.loginId,
    role: user.role,
    fullName: user.fullName,
    supervisorId: user.supervisorId,
    assignedContractorId: contractor?.id || null,
    assignedContractorName: contractor?.contractorName || null,
  };
}

async function updateProfile(userId, fullName) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await prisma.user.update({ where: { id: userId }, data: { fullName: fullName || null } });
  return getProfile(userId);
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

module.exports = { login, getProfile, updateProfile, changePassword };
