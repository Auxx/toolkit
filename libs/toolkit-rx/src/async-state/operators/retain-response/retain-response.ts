import { OperatorFunction, pipe, scan } from 'rxjs';
import { asyncError } from '../../factories/async-error/async-error';
import { asyncLoading } from '../../factories/async-loading/async-loading';
import { AsyncState } from '../../types/async-state.types';

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
