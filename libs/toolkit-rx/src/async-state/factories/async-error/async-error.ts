import { AsyncStateError, AsyncStateErrorWithCache } from '../../types/async-state.types';

/**
 * Creates an `AsyncState` representing an operation that has failed with no data available.
 *
 * @template E The type of the error.
 * @param error Error the operation failed with.
 * @returns State with `loading: false`, `hasData: false`, `hasError: true`, `isCached: false`
 * and the given `error`.
 *
 * @example
 * const state = asyncError(new Error('Not found'));
 * // { loading: false, hasData: false, hasError: true, isCached: false, error: Error('Not found') }
 */
export function asyncError<E = unknown>(error: E): AsyncStateError<E>;
/**
 * Creates an `AsyncState` representing an operation that has failed while previously loaded
 * data is still available, e.g. a refresh that failed after an earlier successful load.
 *
 * `data` is stored as is, so passing `undefined` still produces a cached state.
 *
 * @template T The type of the cached data.
 * @template E The type of the error.
 * @param error Error the operation failed with.
 * @param data Previously loaded data to keep.
 * @returns State with `loading: false`, `hasData: true`, `hasError: true`, `isCached: true`,
 * the given `error` and the given `data`.
 *
 * @example
 * const state = asyncError(new Error('Timeout'), [ 1, 2, 3 ]);
 * // { loading: false, hasData: true, hasError: true, isCached: true, error: Error('Timeout'), data: [ 1, 2, 3 ] }
 */
export function asyncError<T, E = unknown>(error: E, data: T): AsyncStateErrorWithCache<T, E>;
export function asyncError<T, E = unknown>(
  error: E,
  ...args: [] | [ T ]
): AsyncStateError<E> | AsyncStateErrorWithCache<T, E> {
  return args.length === 0
    ? {
      loading: false,
      hasData: false,
      hasError: true,
      isCached: false,
      error
    }
    : {
      loading: false,
      hasData: true,
      hasError: true,
      isCached: true,
      error,
      data: args[0]
    };
}
