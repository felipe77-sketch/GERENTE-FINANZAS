/** Helpers to resolve foreign-key ids to human labels from a list. */
export function nameById<T extends { id: string }>(
  list: T[],
  id: string | null | undefined,
  field: (row: T) => string
): string {
  if (!id) return "—";
  const row = list.find((r) => r.id === id);
  return row ? field(row) : "—";
}
