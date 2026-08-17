import React, { ComponentType, lazy } from 'react';

/**
 * Wraps React.lazy with automatic retry logic to handle chunk load failures
 * caused by deployments, stale browser caches, or transient network blips.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      factory()
        .then(resolve)
        .catch((error) => {
          // Check if this error is related to dynamic import / chunk loading
          const isChunkError =
            error?.name === 'ChunkLoadError' ||
            /Failed to fetch dynamically imported module/i.test(error?.message || '') ||
            /Loading chunk .* failed/i.test(error?.message || '') ||
            /error loading dynamically imported module/i.test(error?.message || '');

          if (retriesLeft <= 0) {
            // If we ran out of retries and it's a chunk load error, reload the window once to fetch latest assets
            const hasReloaded = sessionStorage.getItem('chunk_reload_attempted');
            if (isChunkError && !hasReloaded && typeof window !== 'undefined') {
              sessionStorage.setItem('chunk_reload_attempted', 'true');
              window.location.reload();
              return;
            }
            sessionStorage.removeItem('chunk_reload_attempted');
            reject(error);
            return;
          }

          setTimeout(() => {
            lazyWithRetry(factory, retriesLeft - 1, interval)
              ._payload._result()
              .then(resolve, reject);
          }, interval);
        });
    })
  );
}

export default lazyWithRetry;
