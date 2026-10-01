const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { page, limit, isRead, date } = req.query;
  const result = await notificationService.list(req.user, { page, limit, isRead, date });
  res.json(result);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user);
  res.json(notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user);
  res.json({ message: 'All notifications marked as read' });
});

module.exports = { list, markAsRead, markAllAsRead };
