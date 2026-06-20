import { beforeEach, describe, expect, it } from 'vitest';
import {
  HISTORY_STORAGE_KEY,
  addRecord,
  buildRecord,
  clearHistory,
  createId,
  loadHistory,
  saveHistory,
} from './storage';
import { DEFAULT_INPUTS } from './calculator';

beforeEach(() => {
  localStorage.clear();
});

describe('createId', () => {
  it('produces unique non-empty ids', () => {
    const a = createId();
    const b = createId();
    expect(a).not.toBe('');
    expect(a).not.toBe(b);
  });
});

describe('buildRecord', () => {
  it('builds a record with a computed breakdown and timestamp', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const record = buildRecord(DEFAULT_INPUTS, now);
    expect(record.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(record.breakdown.total).toBeGreaterThan(0);
    expect(record.id).toBeTruthy();
  });
});

describe('history persistence', () => {
  it('round-trips records through localStorage', () => {
    const record = buildRecord(DEFAULT_INPUTS);
    saveHistory([record]);
    const loaded = loadHistory();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.id).toBe(record.id);
  });

  it('returns an empty array when nothing is stored', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('ignores malformed JSON', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, '{not valid json');
    expect(loadHistory()).toEqual([]);
  });

  it('filters out structurally invalid records', () => {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify([{ nope: true }, 42, null]),
    );
    expect(loadHistory()).toEqual([]);
  });

  it('appends and clears records', () => {
    const first = addRecord(loadHistory(), buildRecord(DEFAULT_INPUTS));
    addRecord(first, buildRecord(DEFAULT_INPUTS));
    expect(loadHistory()).toHaveLength(2);

    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
