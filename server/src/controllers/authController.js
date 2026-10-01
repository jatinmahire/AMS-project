const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { loginId, password, selectedRole } = req.body;
  const result = await authService.login(loginId, password, selectedRole);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json(user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({ message: 'Password updated successfully' });
});

module.exports = { login, me, changePassword };
