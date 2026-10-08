import { Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { asyncData, asyncError, asyncLoading } from '../../async-state';
import { filteredState } from './filtered-state';

interface Filters {
  search: string;
  active: boolean;
}

const defaultFilters = (): Filters => ({ search: '', active: true });

describe('filteredState', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('filters', () => {
    it('should start with the default filters', () => {
      const state = filteredState({ defaultFilters, operation: of });

      expect(state.filters$.value).toEqual({ search: '', active: true });
    });

    it('should merge filters with setFilters()', () => {
      const state = filteredState({ defaultFilters, operation: of });

      state.setFilters({ search: 'alice' });

      expect(state.filters$.value).toEqual({ search: 'alice', active: true });
    });

    it('should replace filters with the reducer result in updateFilters()', () => {
      const state = filteredState({ defaultFilters, operation: of });
      const reducer = vi.fn((filters: Filters) => ({ ...filters, active: !filters.active }));
      state.setFilters({ search: 'alice' });

      state.updateFilters(reducer);

      expect(reducer).toHaveBeenCalledExactlyOnceWith({ search: 'alice', active: true });
      expect(state.filters$.value).toEqual({ search: 'alice', active: false });
    });

    it('should restore fresh default filters with resetFilters()', () => {
      const factory = vi.fn(defaultFilters);
      const state = filteredState({ defaultFilters: factory, operation: of });
      state.setFilters({ search: 'alice', active: false });

      state.resetFilters();

      expect(factory).toHaveBeenCalledTimes(2);
      expect(state.filters$.value).toEqual({ search: '', active: true });
    });

    it('should keep the filters unchanged with reload()', () => {
      const state = filteredState({ defaultFilters, operation: of });
      state.setFilters({ search: 'alice' });

      state.reload();

      expect(state.filters$.value).toEqual({ search: 'alice', active: true });
    });
  });

  describe('state', () => {
    it('should emit a loading state followed by data for the default filters', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const operation = vi.fn((filters: Filters) => cold('--r|', { r: `result ${filters.search}` }));
        const state = filteredState({ defaultFilters, operation });

        expectObservable(state.state$).toBe('a-b', {
          a: asyncLoading(),
          b: asyncData('result ')
        });
        flush();

        expect(operation).toHaveBeenCalledExactlyOnceWith({ search: '', active: true });
      });
    });

    it('should not run the operation until subscribed', () => {
      const operation = vi.fn((filters: Filters) => of(filters));

      filteredState({ defaultFilters, operation });

      expect(operation).not.toHaveBeenCalled();
    });

    it('should run the operation again with new filters and retain previous data', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const operation = (filters: Filters) => cold('--r|', { r: `result ${filters.search}` });
        const state = filteredState({ defaultFilters, operation });

        cold('----a').subscribe(() => state.setFilters({ search: 'alice' }));
        cold('--------u').subscribe(() => state.updateFilters(f => ({ ...f, search: 'bob' })));
        cold('------------r').subscribe(() => state.resetFilters());

        expectObservable(state.state$).toBe('a-b-c-d-e-f-g-h', {
          a: asyncLoading(),
          b: asyncData('result '),
          c: asyncLoading('result '),
          d: asyncData('result alice'),
          e: asyncLoading('result alice'),
          f: asyncData('result bob'),
          g: asyncLoading('result bob'),
          h: asyncData('result ')
        });
      });
    });

    it('should run the operation again with the same filters on reload()', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        let calls = 0;
        const operation = vi.fn(() => cold('--r|', { r: ++calls }));
        const state = filteredState({ defaultFilters, operation });

        cold('----r').subscribe(() => state.reload());

        expectObservable(state.state$).toBe('a-b-c-d', {
          a: asyncLoading(),
          b: asyncData(1),
          c: asyncLoading(1),
          d: asyncData(2)
        });
        flush();

        expect(operation).toHaveBeenCalledTimes(2);
        expect(operation).toHaveBeenLastCalledWith({ search: '', active: true });
      });
    });

    it('should cancel the in-flight operation when filters change', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const slow = cold('----r|', { r: 'slow' });
        const fast = cold('--r|', { r: 'fast' });
        const state = filteredState({
          defaultFilters,
          operation: filters => filters.search === '' ? slow : fast
        });

        cold('--a').subscribe(() => state.setFilters({ search: 'alice' }));

        expectObservable(state.state$).toBe('a-b-c', {
          a: asyncLoading(),
          b: asyncLoading(),
          c: asyncData('fast')
        });
        expectSubscriptions(slow.subscriptions).toBe('^-!');
      });
    });

    it('should emit an error state with cached data and keep working after an error', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const operation = (filters: Filters): Observable<string> =>
          filters.search === 'fail'
            ? cold('--#', undefined, 'failure')
            : cold('--r|', { r: `result ${filters.search}` });
        const state = filteredState<Filters, string, string>({ defaultFilters, operation });

        cold('----f').subscribe(() => state.setFilters({ search: 'fail' }));
        cold('--------a').subscribe(() => state.setFilters({ search: 'alice' }));

        expectObservable(state.state$).toBe('a-b-c-d-e-f', {
          a: asyncLoading(),
          b: asyncData('result '),
          c: asyncLoading('result '),
          d: asyncError('failure', 'result '),
          e: asyncLoading('result '),
          f: asyncData('result alice')
        });
      });
    });

    it('should share the operation between subscribers and replay the latest state', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const operation = vi.fn(() => cold('--r|', { r: 'result' }));
        const state = filteredState({ defaultFilters, operation });

        expectObservable(state.state$).toBe('a-b', { a: asyncLoading(), b: asyncData('result') });
        expectObservable(state.state$, '----^').toBe('----b', { b: asyncData('result') });
        flush();

        expect(operation).toHaveBeenCalledOnce();
      });
    });
  });
});
