import { AsyncStateData } from '../../types/async-state.types';

/**
 * Creates an `AsyncStateData` representing an operation that has completed successfully.
 *
 * The resulting state is not loading, has no error and holds fresh (not cached) `data`.
 *
 * @template T The type of the loaded data.
 * @template E The type of the error the state could hold. Defaults to `unknown`.
 * @param data Data produced by the operation.
 * @returns State with `loading: false`, `hasData: true`, `hasError: false`, `isCached: false`
 * and the given `data`.
 *
 * @example
 * const state = asyncData({ name: 'Alice' });
 * // { loading: false, hasData: true, hasError: false, isCached: false, data: { name: 'Alice' } }
 */
export function asyncData<T>(data: T): AsyncStateData<T> {
  return {
    loading: false,
    hasData: true,
    hasError: false,
    isCached: false,
    data
  };
}
