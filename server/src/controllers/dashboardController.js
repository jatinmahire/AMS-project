const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const getCounts = asyncHandler(async (req, res) => {
  const counts = await dashboardService.getCounts();
  res.json(counts);
});

const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await dashboardService.getAlerts();
  res.json(alerts);
});

const getSupervisorCounts = asyncHandler(async (req, res) => {
  const counts = await dashboardService.getSupervisorCounts(req.user);
  res.json(counts);
});

const getContractorCounts = asyncHandler(async (req, res) => {
  const counts = await dashboardService.getContractorCounts(req.user);
  res.json(counts);
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const activity = await dashboardService.getRecentActivity(req.user, req.query.limit);
  res.json(activity);
});

const getActivity = asyncHandler(async (req, res) => {
  const { action, from, to, page, limit } = req.query;
  const result = await dashboardService.listActivity(req.user, { action, from, to, page, limit });
  res.json(result);
});

const getRecentRegistrations = asyncHandler(async (req, res) => {
  const type = req.query.type || 'ALL';
  const rows = await dashboardService.getRecentRegistrations(type);
  res.json(rows);
});

const getAttendanceOverview = asyncHandler(async (req, res) => {
  const overview = await dashboardService.getAttendanceOverview(req.user, req.query.range);
  res.json(overview);
});

module.exports = {
  getAttendanceOverview,
  getCounts,
  getAlerts,
  getSupervisorCounts,
  getContractorCounts,
  getRecentActivity,
  getActivity,
  getRecentRegistrations,
};
