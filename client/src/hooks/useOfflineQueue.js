import { useEffect, useState } from 'react';
import { countQueuedAttendance } from '../utils/offlineQueue';
import { subscribeQueueCount, flushAttendanceQueue } from '../utils/offlineSync';

const FLUSH_INTERVAL_MS = 30000;

export function useOfflineQueue() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    countQueuedAttendance().then(setCount).catch(() => {});
    const unsubscribe = subscribeQueueCount(setCount);

    function handleOnline() {
      flushAttendanceQueue();
    }
    window.addEventListener('online', handleOnline);
    flushAttendanceQueue();

    const interval = setInterval(() => {
      flushAttendanceQueue();
    }, FLUSH_INTERVAL_MS);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  return count;
}
