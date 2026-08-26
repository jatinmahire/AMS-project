const express = require('express');
const cors = require('cors');
const path = require('path');
const { clientUrl } = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
