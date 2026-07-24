export function sortByOrder<T extends { order?: number }>(
  rec: Record<string, T> | null | undefined,
): [string, T][] {
  return Object.entries(rec ?? {}).sort(
    (a, b) => (a[1].order ?? 0) - (b[1].order ?? 0),
  )
}
