import { asyncData } from './async-data';

describe('asyncData', () => {
  it('should create a successfully loaded state', () => {
    expect(asyncData({ name: 'Alice' })).toStrictEqual({
      loading: false,
      hasData: true,
      hasError: false,
      isCached: false,
      data: { name: 'Alice' }
    });
  });

  it('should keep the data reference', () => {
    const data = [ 1, 2, 3 ];

    const state = asyncData(data);

    expect(state.hasData && state.data).toBe(data);
  });

  it.each([
    [ 'undefined', undefined ],
    [ 'null', null ],
    [ 'zero', 0 ],
    [ 'an empty string', '' ],
    [ 'false', false ]
  ])('should treat %s as data', (_, data) => {
    expect(asyncData(data)).toStrictEqual({
      loading: false,
      hasData: true,
      hasError: false,
      isCached: false,
      data
    });
  });
});
