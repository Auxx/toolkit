import { AsyncStateLoading, AsyncStateLoadingWithCache } from '../../types/async-state.types';

/**
 * Creates an `AsyncState` representing an operation that is in progress with no data available yet.
 *
 * @returns State with `loading: true`, `hasData: false`, `hasError: false` and `isCached: false`.
 *
 * @example
 * const state = asyncLoading();
 * // { loading: true, hasData: false, hasError: false, isCached: false }
 */
export function asyncLoading(): AsyncStateLoading;
/**
 * Creates an `AsyncState` representing an operation that is in progress while previously loaded
 * data is still available, e.g. a refresh after an earlier successful load.
 *
 * `data` is stored as is, so passing `undefined` still produces a cached state.
 *
 * @template T The type of the cached data.
 * @param data Previously loaded data to keep while loading.
 * @returns State with `loading: true`, `hasData: true`, `hasError: false`, `isCached: true`
 * and the given `data`.
 *
 * @example
 * const state = asyncLoading([ 1, 2, 3 ]);
 * // { loading: true, hasData: true, hasError: false, isCached: true, data: [ 1, 2, 3 ] }
 */
export function asyncLoading<T>(data: T): AsyncStateLoadingWithCache<T>;
export function asyncLoading<T>(...args: [] | [ T ]): AsyncStateLoading | AsyncStateLoadingWithCache<T> {
  return args.length === 0
    ? {
      loading: true,
      hasData: false,
      hasError: false,
      isCached: false
    }
    : {
      loading: true,
      hasData: true,
      hasError: false,
      isCached: true,
      data: args[0]
    };
}
