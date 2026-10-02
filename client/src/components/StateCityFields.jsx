import { useEffect, useState } from 'react';
import FormField from './FormField';
import SearchableSelect from './SearchableSelect';
import { getCities, getStates } from '../api/geo';

let statesPromise = null;
const citiesCache = new Map();

function loadStates() {
  if (!statesPromise) {
    statesPromise = getStates().catch((err) => {
      statesPromise = null;
      throw err;
    });
  }
  return statesPromise;
}

function loadCities(state) {
  if (!citiesCache.has(state)) {
    citiesCache.set(state, getCities(state).catch((err) => {
      citiesCache.delete(state);
      throw err;
    }));
  }
  return citiesCache.get(state);
}

// Renders the State then City fields (two grid cells). onChange receives only the keys that
// changed, e.g. { state, city: '' } when the state changes, so the parent can merge them.
export default function StateCityFields({ state, city, onChange, errors = {}, required = false }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    loadStates().then((list) => setStates(list.map((s) => s.name))).catch(() => setStates([]));
  }, []);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    loadCities(state)
      .then((list) => !cancelled && setCities(list))
      .catch(() => !cancelled && setCities([]))
      .finally(() => !cancelled && setLoadingCities(false));
    return () => {
      cancelled = true;
    };
  }, [state]);

  return (
    <>
      <FormField label="State" required={required} error={errors.state}>
        <SearchableSelect
          value={state}
          options={states}
          placeholder="Search state"
          loading={states.length === 0}
          error={errors.state}
          onChange={(name) => name !== state && onChange({ state: name, city: '' })}
        />
      </FormField>
      <FormField label="City" required={required} error={errors.city}>
        <SearchableSelect
          value={city}
          options={cities}
          placeholder={state ? 'Search city' : 'Select a state first'}
          disabled={!state}
          loading={loadingCities}
          error={errors.city}
          onChange={(name) => onChange({ city: name })}
        />
      </FormField>
    </>
  );
}
