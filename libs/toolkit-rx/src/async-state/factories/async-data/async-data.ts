import { AsyncState } from '../../types/async-state.types';

export function asyncData<T, E = unknown>(data: T): AsyncState<T, E> {
  return {
    loading: false,
    hasData: true,
    hasError: false,
    isCached: false,
    data
  };
}
