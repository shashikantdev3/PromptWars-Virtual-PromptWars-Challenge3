import { useCallback, useEffect, useState } from 'react';
import type { FootprintInputs, FootprintRecord } from '../domain/types';
import {
  addRecord,
  buildRecord,
  clearHistory as clearStoredHistory,
  loadHistory,
} from '../domain/storage';

interface UseFootprintHistory {
  records: FootprintRecord[];
  save: (inputs: FootprintInputs) => void;
  clear: () => void;
}

/**
 * Manages the persisted history of footprint snapshots. Loads once on mount
 * and keeps localStorage in sync as records are added or cleared.
 */
export function useFootprintHistory(): UseFootprintHistory {
  const [records, setRecords] = useState<FootprintRecord[]>([]);

  useEffect(() => {
    setRecords(loadHistory());
  }, []);

  const save = useCallback((inputs: FootprintInputs) => {
    setRecords((prev) => addRecord(prev, buildRecord(inputs)));
  }, []);

  const clear = useCallback(() => {
    clearStoredHistory();
    setRecords([]);
  }, []);

  return { records, save, clear };
}
