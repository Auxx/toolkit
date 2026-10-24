export interface TextBlockMarkers {
  start: string;
  end: string;
}

export function htmlCommentMarkers(id: string): TextBlockMarkers {
  return {
    start: `<!-- ${id}:start -->`,
    end: `<!-- ${id}:end -->`
  };
}

function countOccurrences(text: string, search: string): number {
  return text.split(search).length - 1;
}

/**
 * Inserts a block of text wrapped in markers into existing content, or replaces the previously inserted block.
 * Content outside the markers is preserved. Throws if the markers are malformed, so user content is never lost.
 */
export function upsertTextBlock(content: string, block: string, markers: TextBlockMarkers): string {
  const wrapped = `${markers.start}\n\n${block.trim()}\n\n${markers.end}`;
  const starts = countOccurrences(content, markers.start);
  const ends = countOccurrences(content, markers.end);

  if (starts === 0 && ends === 0) {
    const existing = content.trimEnd();

    return existing === ''
      ? `${wrapped}\n`
      : `${existing}\n\n${wrapped}\n`;
  }

  const startIndex = content.indexOf(markers.start);
  const endIndex = content.indexOf(markers.end);

  if (starts !== 1 || ends !== 1 || endIndex < startIndex) {
    throw new Error(`Malformed block: expected one "${markers.start}" followed by one "${markers.end}".`);
  }

  return content.slice(0, startIndex) + wrapped + content.slice(endIndex + markers.end.length);
}
