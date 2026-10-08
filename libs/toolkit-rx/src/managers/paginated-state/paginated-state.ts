import { BehaviorSubject, Observable, shareReplay, switchMap } from 'rxjs';
import { retainResponse, toAsyncState } from '../../async-state';
import { AsyncState } from '../../async-state/types/async-state.types';
import { updateSubject } from '../../subjects';

export interface PaginatedFilters {
  page: number;
  pageSize: number;
}

export interface PaginatedState<F, D, E = unknown> {
  readonly filters$: BehaviorSubject<F & PaginatedFilters>;
  readonly state$: Observable<AsyncState<D, E>>;
  readonly setFilters: (filters: Partial<F>) => void;
  readonly setPage: (page: number) => void;
  readonly setPageSize: (pageSize: number) => void;
  readonly updateFilters: (reducer: (filters: F) => F) => void;
  readonly resetFilters: () => void;
  readonly reload: () => void;
}

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
      ),
    setPage: (page: number) =>
      updateSubject(
        filters$,
        f => ({ ...f, page })
      ),
    setPageSize: (pageSize: number) =>
      updateSubject(
        filters$,
        f => ({
          ...f,
          pageSize,
          page: 1
        })
      ),
    updateFilters: (reducer: (filters: F) => F) =>
      updateSubject(
        filters$,
        f => ({
          ...f,
          ...reducer(f),
          page: 1
        })
      ),
    resetFilters: () => filters$.next(df()),
    reload: () => updateSubject(filters$, {})
  };
}
