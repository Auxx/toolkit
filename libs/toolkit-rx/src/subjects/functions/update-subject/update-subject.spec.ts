import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { updateSubject } from './update-subject';

interface User {
  name: string;
  age: number;
}

describe('updateSubject', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('with a reducer', () => {
    it('should replace the current value of a BehaviorSubject with the reducer result', () => {
      testScheduler.run(({ expectObservable }) => {
        const subject = new BehaviorSubject(1);

        expectObservable(updateSubject(subject, value => value + 1), '--^').toBe('--(t|)', { t: true });
        expectObservable(subject).toBe('a-b', { a: 1, b: 2 });
      });
    });

    it('should pass the current value to the reducer', () => {
      testScheduler.run(({ expectObservable, flush }) => {
        const subject = new BehaviorSubject<User>({ name: 'Alice', age: 30 });
        const reducer = vi.fn((user: User) => ({ ...user, age: user.age + 1 }));

        expectObservable(updateSubject(subject, reducer)).toBe('(t|)', { t: true });
        flush();

        expect(reducer).toHaveBeenCalledOnce();
        expect(reducer).toHaveBeenCalledWith({ name: 'Alice', age: 30 });
      });
    });

    it('should use the latest value of a ReplaySubject', () => {
      testScheduler.run(({ expectObservable }) => {
        const subject = new ReplaySubject<number>(1);
        subject.next(1);
        subject.next(5);

        expectObservable(updateSubject(subject, value => value * 10)).toBe('(t|)', { t: true });
        expectObservable(subject).toBe('a', { a: 50 });
      });
    });
  });

  describe('with a partial value', () => {
    it('should merge the partial value into the current value', () => {
      testScheduler.run(({ expectObservable }) => {
        const subject = new BehaviorSubject<User>({ name: 'Alice', age: 30 });

        expectObservable(subject).toBe('a-b', {
          a: { name: 'Alice', age: 30 },
          b: { name: 'Alice', age: 31 }
        });
        expectObservable(updateSubject(subject, { age: 31 }), '--^').toBe('--(t|)', { t: true });
      });
    });

    it('should not mutate the current value', () => {
      testScheduler.run(({ expectObservable, flush }) => {
        const initial: User = { name: 'Alice', age: 30 };
        const subject = new BehaviorSubject(initial);

        expectObservable(updateSubject(subject, { name: 'Bob' })).toBe('(t|)', { t: true });
        flush();

        expect(initial).toEqual({ name: 'Alice', age: 30 });
        expect(subject.value).not.toBe(initial);
        expect(subject.value).toEqual({ name: 'Bob', age: 30 });
      });
    });
  });

  describe('with a plain Subject', () => {
    it('should wait for the next emission and update only once', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const subject = new Subject<number>();
        hot('--a---c', { a: 1, c: 7 }).subscribe(subject);

        expectObservable(subject).toBe('--(ab)c', { a: 1, b: 2, c: 7 });
        expectObservable(updateSubject(subject, value => value + 1)).toBe('--(t|)', { t: true });
      });
    });

    it('should complete without emitting when the subject completes before emitting', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const subject = new Subject<User>();
        hot<User>('--|').subscribe(subject);

        expectObservable(updateSubject(subject, { age: 31 })).toBe('--|');
      });
    });

    it('should error when the subject errors', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const subject = new Subject<User>();
        hot<User>('--#', undefined, 'failure').subscribe(subject);

        expectObservable(updateSubject(subject, { age: 31 })).toBe('--#', undefined, 'failure');
      });
    });
  });

  it('should not update the subject until subscribed', () => {
    testScheduler.run(({ expectObservable }) => {
      const subject = new BehaviorSubject(1);

      updateSubject(subject, value => value + 1);

      expectObservable(subject).toBe('a', { a: 1 });
    });
  });

  it('should update the subject once per subscription', () => {
    testScheduler.run(({ expectObservable }) => {
      const subject = new BehaviorSubject(1);
      const update$ = updateSubject(subject, value => value + 1);

      expectObservable(subject).toBe('a-b-c', { a: 1, b: 2, c: 3 });
      expectObservable(update$, '--^').toBe('--(t|)', { t: true });
      expectObservable(update$, '----^').toBe('----(t|)', { t: true });
    });
  });
});
