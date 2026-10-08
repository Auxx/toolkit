import { delay, of, switchMap } from 'rxjs';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { toAsyncState } from '../to-async-state/to-async-state';
import { retainResponse } from './retain-response';

describe('retainResponse', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  it('should retain response between loading phases', () => {
    testScheduler.run(({ cold, expectObservable, flush }) => {
      const filters = cold('a-b-c', { a: 'a', b: 'b', c: 'c' });
      const result = filters
        .pipe(
          switchMap(f => of(`Value ${f}`).pipe(delay(1), toAsyncState())),
          retainResponse()
        );
      flush();

      expectObservable(result).toBe(
        'abcdef',
        {
          a: {
            hasData: false,
            hasError: false,
            isCached: false,
            loading: true
          },
          b: {
            data: 'Value a',
            hasData: true,
            hasError: false,
            isCached: false,
            loading: false
          },
          c: {
            data: 'Value a',
            hasData: true,
            hasError: false,
            isCached: true,
            loading: true
          },
          d: {
            data: 'Value b',
            hasData: true,
            hasError: false,
            isCached: false,
            loading: false
          },
          e: {
            data: 'Value b',
            hasData: true,
            hasError: false,
            isCached: true,
            loading: true
          },
          f: {
            data: 'Value c',
            hasData: true,
            hasError: false,
            isCached: false,
            loading: false
          }
        }
      );
    });
  });
});
