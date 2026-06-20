import type { FootprintInputs, FootprintRecord } from './types';
import { calculateFootprint, sanitizeInputs } from './calculator';

export const HISTORY_STORAGE_KEY = 'carbonwise.history.v1';
const MAX_RECORDS = 50;

/** Generate a unique id, preferring the platform crypto API. */
export function createId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validate that an unknown parsed value is a structurally sound
 * FootprintRecord. Defends against corrupted or tampered localStorage.
 */
function isValidRecord(value: unknown): value is FootprintRecord {
  if (!isRecord(value)) return false;
  const { id, createdAt, inputs, breakdown } = value;
  if (typeof id !== 'string' || typeof createdAt !== 'string') return false;
  if (!isRecord(inputs) || !isRecord(breakdown)) return false;
  return typeof breakdown.total === 'number';
}

/**
 * Read saved footprint history from localStorage.
 * Returns an empty array on any error (missing, malformed, or denied access).
 */
export function loadHistory(): FootprintRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecord);
  } catch {
    return [];
  }
}

/** Persist history, capping the number of records. Fails silently. */
export function saveHistory(records: FootprintRecord[]): void {
  try {
    const trimmed = records.slice(-MAX_RECORDS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage may be unavailable (private mode / quota). Non-fatal.
  }
}

/** Build a new record from raw inputs (sanitized) at the current time. */
export function buildRecord(
  rawInputs: FootprintInputs,
  now: Date = new Date(),
): FootprintRecord {
  const inputs = sanitizeInputs(rawInputs);
  return {
    id: createId(),
    createdAt: now.toISOString(),
    inputs,
    breakdown: calculateFootprint(inputs),
  };
}

/** Append a record to history and persist it, returning the new array. */
export function addRecord(
  existing: FootprintRecord[],
  record: FootprintRecord,
): FootprintRecord[] {
  const next = [...existing, record].slice(-MAX_RECORDS);
  saveHistory(next);
  return next;
}

/** Remove all saved history. */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
}
