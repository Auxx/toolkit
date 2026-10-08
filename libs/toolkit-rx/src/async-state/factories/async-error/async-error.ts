import { AsyncStateError, AsyncStateErrorWithCache } from '../../types/async-state.types';

export function asyncError<E = unknown>(error: E): AsyncStateError<E>;
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
