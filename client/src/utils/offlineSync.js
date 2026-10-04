import { getQueuedAttendance, removeQueuedAttendance, countQueuedAttendance } from './offlineQueue';
import { createAttendance, updateAttendance, scanAttendance } from '../api/attendance';

export function isNetworkError(err) {
  return !err.response;
}

let flushing = false;
const listeners = new Set();

export function subscribeQueueCount(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

async function notify() {
  const count = await countQueuedAttendance();
  listeners.forEach((callback) => callback(count));
}

// Replays queued attendance submissions in order. Stops at the first item
// that still fails on the network (so it and everything after it retry next
// time) but drops an item the server actually rejects (e.g. a duplicate
// attendance record) since retrying that forever would never succeed.
export async function flushAttendanceQueue() {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    const items = await getQueuedAttendance();
    for (const item of items) {
      try {
        if (item.isScan) {
          await scanAttendance(item.payload);
        } else if (item.isEdit) {
          await updateAttendance(item.editId, item.payload);
        } else {
          await createAttendance(item.payload);
        }
        await removeQueuedAttendance(item.id);
        await notify();
      } catch (err) {
        if (isNetworkError(err)) break;
        await removeQueuedAttendance(item.id);
        await notify();
      }
    }
  } finally {
    flushing = false;
    await notify();
  }
}
