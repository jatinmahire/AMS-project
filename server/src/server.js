const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`AMS server listening on port ${port}`);
});
