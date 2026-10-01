const cron = require('node-cron');
const { runNotificationChecks } = require('../services/notificationService');

// Runs once daily at 02:00 server time — well outside working hours, and
// frequent enough that none of the four trigger conditions go unnoticed for
// more than a day.
function scheduleNotificationJob() {
  cron.schedule('0 2 * * *', async () => {
    try {
      await runNotificationChecks();
    } catch (err) {
      console.error('Notification check job failed:', err);
    }
  });
}

module.exports = { scheduleNotificationJob };
