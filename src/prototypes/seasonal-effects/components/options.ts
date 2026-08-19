/**
 * Shared shape for every "pick one of a few" control, plus the helper that turns
 * a label record into options. Kept apart from the components so both the
 * segmented control and the choice lists can use it without a circular import.
 */

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Options in the order given, so the caller controls how the choices read. */
export function optionsFrom<T extends string>(
  labels: Record<T, string>,
  order: T[],
): SegmentedOption<T>[] {
  return order.map((value) => ({ value, label: labels[value] }));
}
