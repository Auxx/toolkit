import { AsyncStateLoading, AsyncStateLoadingWithCache } from '../../types/async-state.types';

export function asyncLoading(): AsyncStateLoading;
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
