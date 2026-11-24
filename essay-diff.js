/* Sentence comparison runs entirely in the browser using the two saved versions. */
function essaySentences(text) {
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('en', {granularity:'sentence'}) : null;
  return paras(text).flatMap(paragraph => {
    const normalized = paragraph.replace(/\s+/gu, ' ');
    const parts = segmenter ? Array.from(segmenter.segment(normalized), part => part.segment)
      : normalized.split(/(?<=[.!?。！？])\s+/u);
    return parts.map(part => part.trim()).filter(Boolean);
  });
}

function alignEssayParts(before, after, pairCost) {
  const width = after.length + 1;
  // Very large imported documents can still be compared without a quadratic allocation.
  if ((before.length + 1) * width > 250000) {
    let start = 0, end = 0;
    while (start < before.length && start < after.length && before[start] === after[start]) start++;
    while (end < before.length - start && end < after.length - start &&
      before[before.length - 1 - end] === after[after.length - 1 - end]) end++;
    return [
      ...before.slice(0, start).map(part => [part, part]),
      ...before.slice(start, before.length - end).map(part => [part, '']),
      ...after.slice(start, after.length - end).map(part => ['', part]),
      ...before.slice(before.length - end).map(part => [part, part]),
    ];
  }
  const steps = new Uint8Array((before.length + 1) * width);
  let previous = Float64Array.from({length:width}, (_, index) => index);
  let row = new Float64Array(width);
  for (let i = 1; i <= before.length; i++) {
    row[0] = i;
    for (let j = 1; j < width; j++) {
      const pair = previous[j - 1] + pairCost(before[i - 1], after[j - 1]);
      const takeBefore = previous[j] + 1;
      const takeAfter = row[j - 1] + 1;
      const step = pair <= Math.min(takeBefore, takeAfter) ? 0 : takeBefore <= takeAfter ? 1 : 2;
      row[j] = step === 0 ? pair : step === 1 ? takeBefore : takeAfter;
      steps[i * width + j] = step;
    }
    [previous, row] = [row, previous];
  }
  const pairs = [];
  let i = before.length, j = after.length;
  while (i || j) {
    const step = !i ? 2 : !j ? 1 : steps[i * width + j];
    pairs.push([step === 2 ? '' : before[--i], step === 1 ? '' : after[--j]]);
  }
  return pairs.reverse();
}

function essaySentencePairs(before, after) {
  const sentences = [...new Set([...before, ...after])];
  const words = new Map(sentences.map(text => [text, new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])]));
  return alignEssayParts(before, after, (left, right) => {
    if (left === right) return 0;
    const a = words.get(left), b = words.get(right);
    let overlap = 0;
    for (const word of a) if (b.has(word)) overlap++;
    const similarity = 2 * overlap / Math.max(1, a.size + b.size);
    return similarity >= .4 ? 1.8 - similarity : 3;
  });
}

function essayWordChanges(before, after) {
  const tokens = text => text.match(/[\p{L}\p{M}]+(?:[’'-][\p{L}\p{M}]+)*|\p{N}+(?:[.,]\p{N}+)*|\s+|[^\s]/gu) || [];
  let left = '', right = '', removed = '', added = '';
  const changes = [];
  const flush = () => {
    if (!removed && !added) return;
    if (removed.trim() || added.trim()) changes.push([removed.trim(), added.trim()]);
    left += removed.trim() ? `<del>${esc(removed)}</del>` : esc(removed);
    right += added.trim() ? `<ins>${esc(added)}</ins>` : esc(added);
    removed = added = '';
  };
  for (const [oldText, newText] of alignEssayParts(tokens(before), tokens(after), (a, b) => a === b ? 0 : 3)) {
    if (oldText === newText) {
      flush();
      left += esc(oldText);
      right += esc(newText);
    } else {
      removed += oldText;
      added += newText;
    }
  }
  flush();
  return {left, right, changes};
}

const commonEssayRevisions = [
  [/\bdiscuss(?:es|ed|ing)?\s+about\b/i, /\bdiscuss(?:es|ed|ing)?\b/i, '搭配：discuss 可以直接接讨论对象，省掉 about。'],
  [/^although\b[^.!?]*,\s*but\b/i, /^although\b/i, '连词：前半句已有 although，主句可以直接写转折的内容。'],
  [/^because\b[^.!?]*,\s*so\b/i, /^because\b/i, '连词：because 已交代原因，主句可以直接写结果。'],
  [/\bdue to the fact that\b/i, /\bbecause\b/i, '精简：用 because 表达同样的因果关系。'],
  [/\bin order to\b/i, /\bto\b/i, '精简：用 to 短语直接交代目的。'],
];

function explainEssayChange(before, after, changes) {
  if (!before) return '<p>改稿在这里增加了一句。</p>';
  if (!after) return '<p>改稿删去了这一句。</p>';
  const guidance = commonEssayRevisions
    .filter(([oldForm, newForm]) => oldForm.test(before) && newForm.test(after) && !oldForm.test(after))
    .map(([, , explanation]) => `<p>${esc(explanation)}</p>`).join('');
  const list = changes.map(([removed, added]) => {
    const oldText = `「${esc(removed)}」`, newText = `「${esc(added)}」`;
    return `<li>${removed && added ? `${oldText} → ${newText}` : added ? `补入 ${newText}` : `删去 ${oldText}`}</li>`;
  }).join('');
  return guidance + (list ? `<ul>${list}</ul>` : '<p>这一句的空格或标点排版有调整。</p>');
}

function renderEssayComparison(essay, changesOnly) {
  const before = essaySentences(essay.original);
  const after = essaySentences(essay.revised);
  if (!before.length || !after.length) {
    return empty('需要原稿和修改稿', '保存两份正文后，就能查看每一句的变化。');
  }
  const pairs = essaySentencePairs(before, after);
  const changed = pairs.filter(([a, b]) => a !== b);
  const rows = changesOnly ? changed : pairs;
  return `<section class="essay-comparison" aria-label="原稿与修改稿对照">
    <div class="comparison-toolbar">
      <h2 class="sectionTitle">逐句对照</h2>
      <span class="counter">共 ${changed.length} 处改动</span>
      <button type="button" class="btn ghost" data-action="compareChanges" aria-pressed="${changesOnly}">只看改动</button>
    </div>
    ${rows.length ? rows.map(([original, revised]) => {
      const edited = original !== revised;
      const diff = edited ? essayWordChanges(original, revised) : {left:esc(original), right:esc(revised)};
      return `<div class="comparison-row">
        <div class="comparison-pair">
          <div><div class="secondary">原稿</div>${original ? `<p lang="en">${diff.left}</p>` : '<p class="counter">原稿无此句</p>'}</div>
          <div><div class="secondary">修改稿</div>${revised ? `<p lang="en">${diff.right}</p>` : '<p class="counter">修改稿已删除</p>'}</div>
        </div>
        ${edited ? `<details class="comparison-note"><summary>看改动说明</summary>${explainEssayChange(original, revised, diff.changes)}</details>` : ''}
      </div>`;
    }).join('') : '<p class="comparison-empty">两份正文的句子一致。</p>'}
  </section>`;
}
