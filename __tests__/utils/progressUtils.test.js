import {
  calculateProgress,
  countCompleted,
  itemsInCategory,
  categoryProgress,
  isCategoryComplete,
  isChecklistComplete,
  toggleItem,
} from '../../src/utils/progressUtils';

// Small fake checklist so each test stays readable and I only write the
// item shape out once.
const items = [
  { id: 'f1', category: 'Flood', title: 'Flood one', points: 10 },
  { id: 'f2', category: 'Flood', title: 'Flood two', points: 10 },
  { id: 'h1', category: 'Haze', title: 'Haze one', points: 10 },
  { id: 'h2', category: 'Haze', title: 'Haze two', points: 10 },
  { id: 'g1', category: 'General', title: 'General one', points: 10 },
];

describe('calculateProgress', () => {
  test('nothing completed is 0%', () =>
    expect(calculateProgress([], items)).toBe(0));
  test('everything completed is 100%', () =>
    expect(calculateProgress(['f1', 'f2', 'h1', 'h2', 'g1'], items)).toBe(100));
  test('partial completion rounds correctly', () =>
    expect(calculateProgress(['f1', 'f2'], items)).toBe(40));

  // Without the guard this divides by zero and renders NaN on screen.
  test('an empty item list returns 0 rather than NaN', () =>
    expect(calculateProgress([], [])).toBe(0));

  // Saved ids can outlive the checklist items they belonged to.
  test('ids that no longer exist do not count', () =>
    expect(calculateProgress(['deleted-item', 'f1'], items)).toBe(20));
});

describe('countCompleted', () => {
  test('counts only ids that match real items', () =>
    expect(countCompleted(['f1', 'h1', 'ghost'], items)).toBe(2));
});

describe('itemsInCategory', () => {
  test('filters by category', () =>
    expect(itemsInCategory(items, 'Flood')).toHaveLength(2));
  test('returns an empty array for an unused category', () =>
    expect(itemsInCategory([], 'Haze')).toEqual([]));
});

describe('categoryProgress', () => {
  test('reports completion within one category only', () => {
    const result = categoryProgress(['f1', 'f2', 'h1'], items, 'Flood');
    expect(result.completed).toBe(2);
    expect(result.total).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.isComplete).toBe(true);
  });

  test('a partly finished category is not complete', () => {
    const result = categoryProgress(['f1'], items, 'Flood');
    expect(result.isComplete).toBe(false);
    expect(result.percentage).toBe(50);
  });

  // Guards against a badge unlocking because a category happens to be empty.
  test('an empty category is never complete', () => {
    const result = categoryProgress([], [], 'Flood');
    expect(result.isComplete).toBe(false);
  });
});

describe('isCategoryComplete', () => {
  test('true when every item in the category is done', () =>
    expect(isCategoryComplete(['h1', 'h2'], items, 'Haze')).toBe(true));
  test('false when one is still missing', () =>
    expect(isCategoryComplete(['h1'], items, 'Haze')).toBe(false));
});

describe('isChecklistComplete', () => {
  test('true only when everything is done', () =>
    expect(isChecklistComplete(['f1', 'f2', 'h1', 'h2', 'g1'], items)).toBe(true));
  test('false when one item remains', () =>
    expect(isChecklistComplete(['f1', 'f2', 'h1', 'h2'], items)).toBe(false));
  test('an empty checklist is not complete', () =>
    expect(isChecklistComplete([], [])).toBe(false));
});

describe('toggleItem', () => {
  test('adds an unchecked item', () =>
    expect(toggleItem(['f1'], 'f2')).toEqual(['f1', 'f2']));
  test('removes a checked item', () =>
    expect(toggleItem(['f1', 'f2'], 'f1')).toEqual(['f2']));

  // If this mutated the array React would sometimes skip the re-render.
  test('does not change the original array', () => {
    const original = ['f1'];
    toggleItem(original, 'f2');
    expect(original).toEqual(['f1']);
  });
});