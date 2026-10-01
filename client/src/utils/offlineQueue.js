const DB_NAME = 'ams-offline-queue';
const STORE_NAME = 'attendance-submissions';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = run(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function enqueueAttendance(entry) {
  return withStore('readwrite', (store) => store.add(entry));
}

export function getQueuedAttendance() {
  return withStore('readonly', (store) => store.getAll());
}

export function removeQueuedAttendance(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

export function countQueuedAttendance() {
  return withStore('readonly', (store) => store.count());
}
