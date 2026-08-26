function monthRange(month) {
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 1));
  return { gte: start, lt: end };
}

module.exports = { monthRange };
