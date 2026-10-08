import { BehaviorSubject, Observable, shareReplay, switchMap } from 'rxjs';
import { retainResponse, toAsyncState } from '../../async-state';
import { AsyncState } from '../../async-state/types/async-state.types';
import { updateSubject } from '../../subjects';

/**
 * Manager for data that is loaded by an asynchronous operation driven by a set of filters.
 *
 * Created with `filteredState()`.
 *
 * @template F The type of the filters passed to the operation.
 * @template D The type of the data produced by the operation.
 * @template E The type of the error the operation could fail with. Defaults to `unknown`.
 */
export interface FilteredState<F, D, E = unknown> {
  /**
   * Current filters. Every emission triggers the operation again.
   *
   * Prefer the update methods of the manager over calling `next()` directly.
   */
  readonly filters$: BehaviorSubject<F>;

  /**
   * State of the operation for the current filters.
   *
   * Data loaded for previous filters is retained as cached data while the operation for new
   * filters is loading or after it has failed. The stream is shared and replays the latest state
   * to new subscribers. The operation is not started until the first subscription.
   */
  readonly state$: Observable<AsyncState<D, E>>;

  /**
   * Shallow-merges `filters` into the current filters.
   *
   * @param filters Filters to overwrite.
   */
  readonly setFilters: (filters: Partial<F>) => void;

  /**
   * Replaces the current filters with the result of `reducer`.
   *
   * @param reducer Function that receives the current filters and returns the new ones.
   */
  readonly updateFilters: (reducer: (filters: F) => F) => void;

  /**
   * Replaces the current filters with a fresh result of `defaultFilters()`.
   */
  readonly resetFilters: () => void;

  /**
   * Runs the operation again with the current filters.
   */
  readonly reload: () => void;
}

/**
 * Creates a manager for data that is loaded by an asynchronous operation driven by a set of
 * filters, e.g. a search results list.
 *
 * Whenever the filters change, the in-flight operation is cancelled and `operation` is called
 * with the new filters. Its result is exposed in `state$` as `AsyncState`, keeping previously
 * loaded data available as cached data while new data is loading or after an error.
 *
 * Filters are expected to be a plain object, as updates shallow-merge into it.
 *
 * @template F The type of the filters passed to the operation.
 * @template D The type of the data produced by the operation.
 * @template E The type of the error the operation could fail with. Defaults to `unknown`.
 * @param options Manager configuration.
 * @param options.defaultFilters Factory of the initial filters. Called on creation and on every
 * `resetFilters()`.
 * @param options.operation Function that loads data for the given filters.
 * @returns Filtered state manager.
 *
 * @example
 * const users = filteredState({
 *   defaultFilters: () => ({ search: '', active: true }),
 *   operation: filters => http.get<User[]>('/api/users', { params: filters })
 * });
 *
 * users.state$.subscribe(state => render(state));
 * users.setFilters({ search: 'alice' }); // loads /api/users?search=alice&active=true
 * users.resetFilters();                  // loads /api/users?search=&active=true
 */
export function filteredState<F, D, E = unknown>(
  { defaultFilters, operation }: {
    defaultFilters: () => F;
    operation: (filters: F) => Observable<D>;
  }
): FilteredState<F, D, E> {
  const filters$ = new BehaviorSubject<F>(defaultFilters());

  const state$ = filters$
    .pipe(
      switchMap(filters => operation(filters).pipe(toAsyncState<D, E>())),
      retainResponse(),
      shareReplay(1)
    );

  return {
    filters$,
    state$,
    setFilters: (filters: Partial<F>) => updateSubject(filters$, filters).subscribe(),
    updateFilters: (reducer: (filters: F) => F) => updateSubject(filters$, reducer).subscribe(),
    resetFilters: () => filters$.next(defaultFilters()),
    reload: () => updateSubject(filters$, {}).subscribe()
  };
}
