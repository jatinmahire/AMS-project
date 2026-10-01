const app = require('./app');
const { port } = require('./config/env');
const { scheduleNotificationJob } = require('./jobs/notificationJob');

app.listen(port, () => {
  console.log(`AMS server listening on port ${port}`);
  scheduleNotificationJob();
});
