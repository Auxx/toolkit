import { OperatorFunction, pipe, scan } from 'rxjs';
import { asyncError } from '../../factories/async-error/async-error';
import { asyncLoading } from '../../factories/async-loading/async-loading';
import { AsyncState } from '../../types/async-state.types';

/**
 * Keeps the most recently loaded data available across subsequent loading and error states.
 *
 * Useful when a stream of `AsyncState` objects is restarted (e.g. by `switchMap` on changing
 * filters): instead of dropping to an empty loading state, the previous data is retained and
 * exposed as cached data.
 *
 * - A loading state following a state with data becomes a loading state with that data cached.
 * - An error state following a state with data becomes an error state with that data cached.
 * - Any other state is passed through unchanged.
 *
 * @template T The type of the data held by the states.
 * @template E The type of the error the states could hold. Defaults to `unknown`.
 * @returns Operator that emits `AsyncState<T, E>` with the last known data retained.
 *
 * @example
 * filters$.pipe(
 *   switchMap(filters => loadItems(filters).pipe(toAsyncState())),
 *   retainResponse()
 * );
 * // { loading: true, hasData: false, hasError: false, isCached: false }
 * // { loading: false, hasData: true, hasError: false, isCached: false, data: items1 }
 * // { loading: true, hasData: true, hasError: false, isCached: true, data: items1 }
 * // { loading: false, hasData: true, hasError: false, isCached: false, data: items2 }
 */
export const retainResponse = <T, E = unknown>(): OperatorFunction<AsyncState<T, E>, AsyncState<T, E>> =>
  pipe(scan((acc, value) => {
    if (value.loading && acc.hasData) {
      return asyncLoading(acc.data);
    }

    if (value.hasError && acc.hasData) {
      return asyncError(value.error, acc.data);
    }

    return value;
  }));
