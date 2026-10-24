import { BehaviorSubject, Observable, shareReplay, switchMap } from 'rxjs';
import { retainResponse, toAsyncState } from '../../async-state';
import { AsyncState } from '../../async-state/types/async-state.types';
import { updateSubject } from '../../subjects';

/**
 * Pagination parameters added to the filters managed by `paginatedState()`.
 */
export interface PaginatedFilters {
  /**
   * Current page, starting from `1`.
   */
  page: number;

  /**
   * Number of items per page.
   */
  pageSize: number;
}

/**
 * Manager for paginated data that is loaded by an asynchronous operation driven by a set of
 * filters.
 *
 * Created with `paginatedState()`.
 *
 * @template F The type of the filters passed to the operation, excluding pagination parameters.
 * @template D The type of the data produced by the operation.
 * @template E The type of the error the operation could fail with. Defaults to `unknown`.
 */
export interface PaginatedState<F, D, E = unknown> {
  /**
   * Current filters together with pagination parameters. Every emission triggers the operation
   * again.
   *
   * Prefer the update methods of the manager over calling `next()` directly.
   */
  readonly filters$: BehaviorSubject<F & PaginatedFilters>;

  /**
   * State of the operation for the current filters and page.
   *
   * Data loaded for previous filters or pages is retained as cached data while the operation for
   * new ones is loading or after it has failed. The stream is shared and replays the latest state
   * to new subscribers. The operation is not started until the first subscription.
   */
  readonly state$: Observable<AsyncState<D, E>>;

  /**
   * Shallow-merges `filters` into the current filters and goes back to the first page.
   *
   * @param filters Filters to overwrite.
   */
  readonly setFilters: (filters: Partial<F>) => void;

  /**
   * Switches to `page`, keeping the other filters.
   *
   * @param page Page to switch to, starting from `1`.
   */
  readonly setPage: (page: number) => void;

  /**
   * Changes the number of items per page and goes back to the first page.
   *
   * @param pageSize New number of items per page.
   */
  readonly setPageSize: (pageSize: number) => void;

  /**
   * Shallow-merges the result of `reducer` into the current filters and goes back to the first
   * page.
   *
   * @param reducer Function that receives the current filters and returns the new ones.
   */
  readonly updateFilters: (reducer: (filters: F) => F) => void;

  /**
   * Replaces the current filters with a fresh result of `defaultFilters()`, goes back to the first
   * page and restores the page size from `defaultPageSize()`.
   */
  readonly resetFilters: () => void;

  /**
   * Runs the operation again with the current filters and page.
   */
  readonly reload: () => void;
}

/**
 * Creates a manager for paginated data that is loaded by an asynchronous operation driven by a
 * set of filters, e.g. a table with search and pagination.
 *
 * Works like `filteredState()`, but adds `page` and `pageSize` to the filters. Pages start from
 * `1`. Any change to the filters or the page size goes back to the first page, as the current
 * page may no longer exist.
 *
 * Whenever the filters change, the in-flight operation is cancelled and `operation` is called
 * with the new filters. Its result is exposed in `state$` as `AsyncState`, keeping previously
 * loaded data available as cached data while new data is loading or after an error.
 *
 * Filters are expected to be a plain object, as updates shallow-merge into it.
 *
 * @template F The type of the filters passed to the operation, excluding pagination parameters.
 * @template D The type of the data produced by the operation.
 * @template E The type of the error the operation could fail with. Defaults to `unknown`.
 * @param options Manager configuration.
 * @param options.defaultFilters Factory of the initial filters. Called on creation and on every
 * `resetFilters()`.
 * @param options.defaultPageSize Factory of the initial page size. Called on creation and on
 * every `resetFilters()`.
 * @param options.operation Function that loads data for the given filters and page.
 * @returns Paginated state manager.
 *
 * @example
 * const users = paginatedState({
 *   defaultFilters: () => ({ search: '' }),
 *   defaultPageSize: () => 20,
 *   operation: filters => http.get<Page<User>>('/api/users', { params: filters })
 * });
 *
 * users.state$.subscribe(state => render(state));
 * users.setPage(3);                      // loads /api/users?search=&page=3&pageSize=20
 * users.setFilters({ search: 'alice' }); // loads /api/users?search=alice&page=1&pageSize=20
 */
export function paginatedState<F, D, E = unknown>(
  { defaultFilters, defaultPageSize, operation }: {
    defaultFilters: () => F;
    defaultPageSize: () => number;
    operation: (filters: F & PaginatedFilters) => Observable<D>;
  }
): PaginatedState<F, D, E> {
  const df = (): F & PaginatedFilters => ({
    ...defaultFilters(),
    page: 1,
    pageSize: defaultPageSize()
  });

  const filters$ = new BehaviorSubject<F & PaginatedFilters>(df());

  const state$ = filters$
    .pipe(
      switchMap(filters => operation(filters).pipe(toAsyncState<D, E>())),
      retainResponse(),
      shareReplay(1)
    );

  return {
    filters$,
    state$,
    setFilters: (filters: Partial<F>) =>
      updateSubject(
        filters$,
        f => ({
          ...f,
          ...filters,
          page: 1
        })
      ).subscribe(),
    setPage: (page: number) =>
      updateSubject(
        filters$,
        f => ({ ...f, page })
      ).subscribe(),
    setPageSize: (pageSize: number) =>
      updateSubject(
        filters$,
        f => ({
          ...f,
          pageSize,
          page: 1
        })
      ).subscribe(),
    updateFilters: (reducer: (filters: F) => F) =>
      updateSubject(
        filters$,
        f => ({
          ...f,
          ...reducer(f),
          page: 1
        })
      ).subscribe(),
    resetFilters: () => filters$.next(df()),
    reload: () => updateSubject(filters$, {}).subscribe()
  };
}
