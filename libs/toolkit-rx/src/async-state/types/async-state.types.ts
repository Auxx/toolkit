interface AsyncStateWithData<T> {
  hasData: true;
  data: T;
}

export interface AsyncStateLoading {
  loading: true;
  hasData: false;
  hasError: false;
  isCached: false;
}

export interface AsyncStateLoadingWithCache<T> extends AsyncStateWithData<T> {
  loading: true;
  hasError: false;
  isCached: true;
}

export interface AsyncStateError<E = unknown> {
  loading: false;
  hasData: false;
  hasError: true;
  isCached: false;
  error: E;
}

export interface AsyncStateErrorWithCache<T, E = unknown> extends AsyncStateWithData<T> {
  loading: false;
  hasError: true;
  isCached: true;
  error: E;
}

export interface AsyncStateData<T> extends AsyncStateWithData<T> {
  loading: false;
  hasError: false;
  isCached: false;
}

/**
 * A type safe representation of the state of an asynchronous operation. The AsyncState type can
 * be one of several states: loading, loading with cached data, error, error
 * with cached data, or successfully loaded data.
 *
 * @template T The type of the data associated with a successful state or cached data.
 * @template E The type of the error associated with an error state. Defaults to `unknown`.
 */
export type AsyncState<T, E = unknown> =
  | AsyncStateLoading
  | AsyncStateLoadingWithCache<T>
  | AsyncStateError<E>
  | AsyncStateErrorWithCache<T, E>
  | AsyncStateData<T>;
