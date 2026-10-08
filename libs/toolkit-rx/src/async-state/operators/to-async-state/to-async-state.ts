import { catchError, map, of, OperatorFunction, pipe, startWith } from 'rxjs';
import { asyncData } from '../../factories/async-data/async-data';
import { asyncError } from '../../factories/async-error/async-error';
import { asyncLoading } from '../../factories/async-loading/async-loading';
import { AsyncState } from '../../types/async-state.types';

export const toAsyncState = <T, E = unknown>(defaultValue?: T): OperatorFunction<T, AsyncState<T, E>> =>
  pipe(
    map(res => asyncData(res)),
    startWith(defaultValue !== undefined ? asyncLoading(defaultValue) : asyncLoading()),
    catchError(error => of(asyncError(error)))
  );
