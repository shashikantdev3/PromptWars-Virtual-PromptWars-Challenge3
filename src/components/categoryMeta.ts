import type { FootprintBreakdown } from '../domain/types';

export interface CategoryDatum {
  key: keyof Omit<FootprintBreakdown, 'total'>;
  label: string;
  color: string;
}

/** Display metadata for each footprint category (label + color). */
export const CATEGORY_META: ReadonlyArray<CategoryDatum> = [
  {
    key: 'transport',
    label: 'Ground transport',
    color: 'var(--cat-transport)',
  },
  { key: 'flights', label: 'Flights', color: 'var(--cat-flights)' },
  { key: 'home', label: 'Home energy', color: 'var(--cat-home)' },
  { key: 'food', label: 'Food & diet', color: 'var(--cat-food)' },
  { key: 'goods', label: 'Goods & shopping', color: 'var(--cat-goods)' },
];

/** Resolve recharts-friendly hex colors (recharts cannot read CSS vars). */
export const CATEGORY_HEX: Record<CategoryDatum['key'], string> = {
  transport: '#2563eb',
  flights: '#7c3aed',
  home: '#0f766e',
  food: '#ca8a04',
  goods: '#db2777',
};
