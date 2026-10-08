import { map, Observable, Subject, take, tap } from 'rxjs';

/**
 * Updates a subject based on its current value, using a reducer.
 *
 * Takes the next value available from `subject` (for a `BehaviorSubject` or `ReplaySubject`
 * that is its current value, for a plain `Subject` it is the next value emitted), passes it to
 * `reducer` and pushes the result back into `subject` with `next()`.
 *
 * The update is lazy: nothing happens until the returned observable is subscribed to.
 * Only one value is ever taken, so each subscription performs at most one update.
 *
 * @param subject Subject to update.
 * @param reducer Function that receives the current value and returns the new one.
 * @returns Observable that emits `true` and completes once the update has been pushed into
 * `subject`. It completes without emitting if `subject` completes before emitting a value,
 * and errors if `subject` errors.
 *
 * @example
 * const counter$ = new BehaviorSubject(1);
 *
 * updateSubject(counter$, count => count + 1).subscribe(); // counter$ now holds 2
 */
export function updateSubject<T>(subject: Subject<T>, reducer: (data: T) => T): Observable<boolean>;
/**
 * Updates a subject by shallow-merging a partial value into its current value.
 *
 * Takes the next value available from `subject` (for a `BehaviorSubject` or `ReplaySubject`
 * that is its current value, for a plain `Subject` it is the next value emitted) and pushes
 * `{ ...current, ...data }` back into `subject` with `next()`. Intended for subjects holding
 * plain objects.
 *
 * The update is lazy: nothing happens until the returned observable is subscribed to.
 * Only one value is ever taken, so each subscription performs at most one update.
 *
 * @param subject Subject to update.
 * @param data Properties to overwrite in the current value.
 * @returns Observable that emits `true` and completes once the update has been pushed into
 * `subject`. It completes without emitting if `subject` completes before emitting a value,
 * and errors if `subject` errors.
 *
 * @example
 * const user$ = new BehaviorSubject({ name: 'Alice', age: 30 });
 *
 * updateSubject(user$, { age: 31 }).subscribe(); // user$ now holds { name: 'Alice', age: 31 }
 */
export function updateSubject<T>(subject: Subject<T>, data: Partial<T>): Observable<boolean>;
export function updateSubject<T>(
  subject: Subject<T>,
  dataOrReducer: Partial<T> | ((data: T) => T)
): Observable<boolean> {
  return subject
    .pipe(
      take(1),
      tap(result => {
        subject.next(
          typeof dataOrReducer === 'function'
            ? dataOrReducer(result)
            : { ...result, ...dataOrReducer }
        );
      }),
      map(() => true)
    );
}
