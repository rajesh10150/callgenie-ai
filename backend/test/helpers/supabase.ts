/**
 * Test helpers for mocking the Supabase query builder.
 *
 * The real `@supabase/supabase-js` query builder is chainable and "thenable":
 * e.g. `await supabase.from('t').select('*').eq('id', 1).single()`.
 * `chain()` returns an object that mimics that: every filter/modifier method
 * returns the same builder, and awaiting the builder (or calling `.single()` /
 * `.maybeSingle()`) resolves to the provided `{ data, error, count }` result.
 */
export interface QueryResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

const CHAIN_METHODS = [
  'select', 'insert', 'update', 'delete', 'upsert',
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is',
  'or', 'and', 'ilike', 'like', 'order', 'range', 'limit',
  'contains', 'match', 'not', 'filter', 'overlaps', 'textSearch',
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Chain = any;

export function chain(result: QueryResult = { data: null, error: null }): Chain {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {};
  for (const m of CHAIN_METHODS) {
    builder[m] = jest.fn(() => builder);
  }
  builder.single = jest.fn(() => Promise.resolve(result));
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builder.then = (resolve: any, reject: any) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}
