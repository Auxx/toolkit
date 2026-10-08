import { asyncError } from './async-error';

describe('asyncError', () => {
  describe('without data', () => {
    it('should create an error state with no data', () => {
      const error = new Error('Not found');

      expect(asyncError(error)).toStrictEqual({
        loading: false,
        hasData: false,
        hasError: true,
        isCached: false,
        error
      });
    });

    it('should not add a data property', () => {
      expect(asyncError('failure')).not.toHaveProperty('data');
    });

    it('should keep the error reference', () => {
      const error = new Error('Not found');

      expect(asyncError(error).error).toBe(error);
    });
  });

  describe('with data', () => {
    it('should create an error state with cached data', () => {
      const error = new Error('Timeout');

      expect(asyncError(error, [ 1, 2, 3 ])).toStrictEqual({
        loading: false,
        hasData: true,
        hasError: true,
        isCached: true,
        error,
        data: [ 1, 2, 3 ]
      });
    });

    it('should keep the error and data references', () => {
      const error = new Error('Timeout');
      const data = { name: 'Alice' };

      const state = asyncError(error, data);

      expect(state.error).toBe(error);
      expect(state.data).toBe(data);
    });

    it.each([
      [ 'undefined', undefined ],
      [ 'null', null ],
      [ 'zero', 0 ],
      [ 'an empty string', '' ],
      [ 'false', false ]
    ])('should treat %s as cached data', (_, data) => {
      expect(asyncError('failure', data)).toStrictEqual({
        loading: false,
        hasData: true,
        hasError: true,
        isCached: true,
        error: 'failure',
        data
      });
    });
  });
});
