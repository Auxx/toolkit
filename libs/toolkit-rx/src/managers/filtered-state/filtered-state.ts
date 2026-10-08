import { BehaviorSubject, Observable, shareReplay, switchMap } from 'rxjs';
import { retainResponse, toAsyncState } from '../../async-state';
import { AsyncState } from '../../async-state/types/async-state.types';
import { updateSubject } from '../../subjects';

export interface FilteredState<F, D, E = unknown> {
  readonly filters$: BehaviorSubject<F>;
  readonly state$: Observable<AsyncState<D, E>>;
  readonly setFilters: (filters: Partial<F>) => void;
  readonly updateFilters: (reducer: (filters: F) => F) => void;
  readonly resetFilters: () => void;
  readonly reload: () => void;
}

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
    setFilters: (filters: Partial<F>) => updateSubject(filters$, filters),
    updateFilters: (reducer: (filters: F) => F) => updateSubject(filters$, reducer),
    resetFilters: () => filters$.next(defaultFilters()),
    reload: () => updateSubject(filters$, {})
  };
}
