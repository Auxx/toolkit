import { asyncLoading } from './async-loading';

describe('asyncLoading', () => {
  describe('without data', () => {
    it('should create a loading state with no data', () => {
      expect(asyncLoading()).toStrictEqual({
        loading: true,
        hasData: false,
        hasError: false,
        isCached: false
      });
    });

    it('should not add a data property', () => {
      expect(asyncLoading()).not.toHaveProperty('data');
    });
  });

  describe('with data', () => {
    it('should create a loading state with cached data', () => {
      expect(asyncLoading([ 1, 2, 3 ])).toStrictEqual({
        loading: true,
        hasData: true,
        hasError: false,
        isCached: true,
        data: [ 1, 2, 3 ]
      });
    });

    it('should keep the data reference', () => {
      const data = { name: 'Alice' };

      expect(asyncLoading(data).data).toBe(data);
    });

    it.each([
      [ 'undefined', undefined ],
      [ 'null', null ],
      [ 'zero', 0 ],
      [ 'an empty string', '' ],
      [ 'false', false ]
    ])('should treat %s as cached data', (_, data) => {
      expect(asyncLoading(data)).toStrictEqual({
        loading: true,
        hasData: true,
        hasError: false,
        isCached: true,
        data
      });
    });
  });
});
