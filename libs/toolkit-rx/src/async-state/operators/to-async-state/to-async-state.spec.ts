import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { toAsyncState } from './to-async-state';

describe('toAsyncState', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  it('should create an AsyncState from an observable', () => {
    testScheduler.run(({ cold, expectObservable, flush }) => {
      const source = cold('-a-|', { a: 'ok' });
      const result = source.pipe(toAsyncState());
      flush();

      expectObservable(result).toBe(
        'ab-|',
        {
          a: {
            hasData: false,
            hasError: false,
            isCached: false,
            loading: true
          },
          b: {
            data: 'ok',
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
