import { Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { asyncData, asyncError, asyncLoading } from '../../async-state';
import { PaginatedFilters, paginatedState } from './paginated-state';

interface Filters {
  search: string;
  active: boolean;
}

const defaultFilters = (): Filters => ({ search: '', active: true });
const defaultPageSize = () => 20;

describe('paginatedState', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('filters', () => {
    it('should start with the default filters on the first page', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });

      expect(state.filters$.value).toEqual({ search: '', active: true, page: 1, pageSize: 20 });
    });

    it('should switch page with setPage() and keep the other filters', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });
      state.setFilters({ search: 'alice' });

      state.setPage(3);

      expect(state.filters$.value).toEqual({ search: 'alice', active: true, page: 3, pageSize: 20 });
    });

    it('should merge filters and go back to the first page with setFilters()', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });
      state.setPage(3);

      state.setFilters({ search: 'alice' });

      expect(state.filters$.value).toEqual({ search: 'alice', active: true, page: 1, pageSize: 20 });
    });

    it('should change page size and go back to the first page with setPageSize()', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });
      state.setPage(3);

      state.setPageSize(50);

      expect(state.filters$.value).toEqual({ search: '', active: true, page: 1, pageSize: 50 });
    });

    it('should merge the reducer result and go back to the first page with updateFilters()', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });
      const reducer = vi.fn((filters: Filters) => ({ ...filters, active: !filters.active }));
      state.setPageSize(50);
      state.setPage(3);

      state.updateFilters(reducer);

      expect(reducer).toHaveBeenCalledExactlyOnceWith({ search: '', active: true, page: 3, pageSize: 50 });
      expect(state.filters$.value).toEqual({ search: '', active: false, page: 1, pageSize: 50 });
    });

    it('should go back to the first page even if the reducer in updateFilters() sets a page', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });
      state.setPage(3);

      state.updateFilters(filters => ({ ...filters, page: 5 }) as Filters);

      expect(state.filters$.value.page).toBe(1);
    });

    it('should restore fresh defaults including page size with resetFilters()', () => {
      const filtersFactory = vi.fn(defaultFilters);
      const pageSizeFactory = vi.fn(defaultPageSize);
      const state = paginatedState({
        defaultFilters: filtersFactory,
        defaultPageSize: pageSizeFactory,
        operation: of
      });
      state.setFilters({ search: 'alice' });
      state.setPageSize(50);
      state.setPage(3);

      state.resetFilters();

      expect(filtersFactory).toHaveBeenCalledTimes(2);
      expect(pageSizeFactory).toHaveBeenCalledTimes(2);
      expect(state.filters$.value).toEqual({ search: '', active: true, page: 1, pageSize: 20 });
    });

    it('should keep the filters and page unchanged with reload()', () => {
      const state = paginatedState({ defaultFilters, defaultPageSize, operation: of });
      state.setPage(3);

      state.reload();

      expect(state.filters$.value).toEqual({ search: '', active: true, page: 3, pageSize: 20 });
    });
  });

  describe('state', () => {
    const describePage = (filters: Filters & PaginatedFilters) =>
      `${filters.search}:${filters.page}/${filters.pageSize}`;

    it('should emit a loading state followed by data for the first page', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const operation = vi.fn((filters: Filters & PaginatedFilters) => cold('--r|', { r: describePage(filters) }));
        const state = paginatedState({ defaultFilters, defaultPageSize, operation });

        expectObservable(state.state$).toBe('a-b', {
          a: asyncLoading(),
          b: asyncData(':1/20')
        });
        flush();

        expect(operation).toHaveBeenCalledExactlyOnceWith({ search: '', active: true, page: 1, pageSize: 20 });
      });
    });

    it('should not run the operation until subscribed', () => {
      const operation = vi.fn((filters: Filters & PaginatedFilters) => of(filters));

      paginatedState({ defaultFilters, defaultPageSize, operation });

      expect(operation).not.toHaveBeenCalled();
    });

    it('should run the operation again on every change and retain previous data', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const operation = (filters: Filters & PaginatedFilters) => cold('--r|', { r: describePage(filters) });
        const state = paginatedState({ defaultFilters, defaultPageSize, operation });

        cold('----p').subscribe(() => state.setPage(2));
        cold('--------s').subscribe(() => state.setPageSize(50));
        cold('------------f').subscribe(() => state.setFilters({ search: 'alice' }));
        cold('----------------r').subscribe(() => state.reload());

        expectObservable(state.state$).toBe('a-b-c-d-e-f-g-h-i-j', {
          a: asyncLoading(),
          b: asyncData(':1/20'),
          c: asyncLoading(':1/20'),
          d: asyncData(':2/20'),
          e: asyncLoading(':2/20'),
          f: asyncData(':1/50'),
          g: asyncLoading(':1/50'),
          h: asyncData('alice:1/50'),
          i: asyncLoading('alice:1/50'),
          j: asyncData('alice:1/50')
        });
      });
    });

    it('should cancel the in-flight operation when the page changes', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const slow = cold('----r|', { r: 'page 1' });
        const fast = cold('--r|', { r: 'page 2' });
        const state = paginatedState({
          defaultFilters,
          defaultPageSize,
          operation: filters => filters.page === 1 ? slow : fast
        });

        cold('--p').subscribe(() => state.setPage(2));

        expectObservable(state.state$).toBe('a-b-c', {
          a: asyncLoading(),
          b: asyncLoading(),
          c: asyncData('page 2')
        });
        expectSubscriptions(slow.subscriptions).toBe('^-!');
      });
    });

    it('should emit an error state with cached data and keep working after an error', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const operation = (filters: Filters & PaginatedFilters): Observable<string> =>
          filters.page === 2
            ? cold('--#', undefined, 'failure')
            : cold('--r|', { r: describePage(filters) });
        const state = paginatedState<Filters, string, string>({ defaultFilters, defaultPageSize, operation });

        cold('----p').subscribe(() => state.setPage(2));
        cold('--------p').subscribe(() => state.setPage(3));

        expectObservable(state.state$).toBe('a-b-c-d-e-f', {
          a: asyncLoading(),
          b: asyncData(':1/20'),
          c: asyncLoading(':1/20'),
          d: asyncError('failure', ':1/20'),
          e: asyncLoading(':1/20'),
          f: asyncData(':3/20')
        });
      });
    });

    it('should share the operation between subscribers and replay the latest state', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const operation = vi.fn(() => cold('--r|', { r: 'result' }));
        const state = paginatedState({ defaultFilters, defaultPageSize, operation });

        expectObservable(state.state$).toBe('a-b', { a: asyncLoading(), b: asyncData('result') });
        expectObservable(state.state$, '----^').toBe('----b', { b: asyncData('result') });
        flush();

        expect(operation).toHaveBeenCalledOnce();
      });
    });
  });
});
