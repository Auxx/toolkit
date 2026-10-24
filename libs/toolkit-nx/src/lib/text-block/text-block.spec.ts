import { htmlCommentMarkers, upsertTextBlock } from './text-block';

describe('Text Block', () => {
  const markers = htmlCommentMarkers('my-block');

  const wrapped = (block: string) => `<!-- my-block:start -->\n\n${block}\n\n<!-- my-block:end -->`;

  describe('htmlCommentMarkers', () => {
    it('should create HTML comment markers', () => {
      expect(markers).toEqual({ start: '<!-- my-block:start -->', end: '<!-- my-block:end -->' });
    });
  });

  describe('upsertTextBlock', () => {
    it.each`
    content
    ${''}
    ${'\n  \n'}
    `('should create a block in empty content $content', ({ content }) => {
      expect(upsertTextBlock(content, 'Block', markers)).toBe(`${wrapped('Block')}\n`);
    });

    it('should append a block after existing content', () => {
      expect(upsertTextBlock('# My rules\n\nBe nice.\n', 'Block', markers))
        .toBe(`# My rules\n\nBe nice.\n\n${wrapped('Block')}\n`);
    });

    it('should replace an existing block and keep content around it', () => {
      const content = `# Before\n\n${wrapped('Old block')}\n\n# After\n`;

      expect(upsertTextBlock(content, 'New block', markers))
        .toBe(`# Before\n\n${wrapped('New block')}\n\n# After\n`);
    });

    it('should be idempotent', () => {
      const once = upsertTextBlock('# My rules\n', 'Block', markers);

      expect(upsertTextBlock(once, 'Block', markers)).toBe(once);
    });

    it('should trim the block', () => {
      expect(upsertTextBlock('', '\n\nBlock\n\n', markers)).toBe(`${wrapped('Block')}\n`);
    });

    it.each`
    content                                                                         | reason
    ${'<!-- my-block:start -->\nBlock'}                                             | ${'missing end'}
    ${'Block\n<!-- my-block:end -->'}                                               | ${'missing start'}
    ${'<!-- my-block:end -->\nBlock\n<!-- my-block:start -->'}                      | ${'wrong order'}
    ${`${'<!-- my-block:start -->\nA\n<!-- my-block:end -->'}\n${'<!-- my-block:start -->\nB\n<!-- my-block:end -->'}`} | ${'duplicated block'}
    `('should throw on malformed markers ($reason)', ({ content }) => {
      expect(() => upsertTextBlock(content, 'Block', markers)).toThrow('Malformed block');
    });
  });
});
