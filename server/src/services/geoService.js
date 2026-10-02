const countries = require('@countrystatecity/countries');
const ApiError = require('../utils/ApiError');

const COUNTRY = 'IN';
let statesCache = null;
const citiesCache = new Map();

async function listStates() {
  if (!statesCache) {
    const states = await countries.getStatesOfCountry(COUNTRY);
    statesCache = states
      .map((s) => ({ code: s.iso2, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return statesCache;
}

// Accepts the state's name (what's stored on records) or its ISO code.
async function listCities(state) {
  const states = await listStates();
  const match = states.find((s) => s.code === state || s.name.toLowerCase() === String(state).toLowerCase());
  if (!match) throw new ApiError(404, `Unknown state: ${state}`);

  if (!citiesCache.has(match.code)) {
    const cities = await countries.getCitiesOfState(COUNTRY, match.code);
    citiesCache.set(match.code, [...new Set(cities.map((c) => c.name))].sort((a, b) => a.localeCompare(b)));
  }
  return citiesCache.get(match.code);
}

module.exports = { listStates, listCities };
