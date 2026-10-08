import { catchError, map, of, OperatorFunction, pipe, startWith } from 'rxjs';
import { asyncData } from '../../factories/async-data/async-data';
import { asyncError } from '../../factories/async-error/async-error';
import { asyncLoading } from '../../factories/async-loading/async-loading';
import { AsyncState } from '../../types/async-state.types';

/**
 * Converts a stream of values into a stream of `AsyncState` objects describing the lifecycle of
 * the source.
 *
 * Immediately emits a loading state, then a data state for every value emitted by the source.
 * If the source errors, an error state is emitted instead and the resulting stream completes.
 *
 * @template T The type of the values emitted by the source.
 * @template E The type of the error the state could hold. Defaults to `unknown`.
 * @param defaultValue Optional value to expose as cached data in the initial loading state.
 * When omitted, the initial state has no data.
 * @returns Operator that maps source values to `AsyncState<T, E>`.
 *
 * @example
 * http.get<User>('/api/user').pipe(toAsyncState());
 * // { loading: true, hasData: false, hasError: false, isCached: false }
 * // { loading: false, hasData: true, hasError: false, isCached: false, data: user }
 *
 * @example
 * http.get<User[]>('/api/users').pipe(toAsyncState([]));
 * // { loading: true, hasData: true, hasError: false, isCached: true, data: [] }
 * // { loading: false, hasData: true, hasError: false, isCached: false, data: users }
 */
export const toAsyncState = <T, E = unknown>(defaultValue?: T): OperatorFunction<T, AsyncState<T, E>> =>
  pipe(
    map(res => asyncData(res)),
    startWith(defaultValue !== undefined ? asyncLoading(defaultValue) : asyncLoading()),
    catchError(error => of(asyncError(error)))
  );
