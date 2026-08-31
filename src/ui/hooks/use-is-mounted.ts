import { useSyncExternalStore } from 'react';

function noop() {
  /*
  no cleanup required
  */
}

function emptySubscribe() {
  return noop;
}

export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
