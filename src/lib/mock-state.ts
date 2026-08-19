import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Simulated data states.
 *
 * House rule: every prototype must be demonstrable in all four states, because
 * "what does this look like while it loads / when it's empty / when it breaks"
 * is exactly the question stakeholders ask. The state lives in the URL
 * (`#/p/slug?state=empty`) so a specific state can be linked and screenshotted.
 */

export const PROTOTYPE_STATES = ['data', 'loading', 'empty', 'error'] as const;
export type PrototypeState = (typeof PROTOTYPE_STATES)[number];

const STATE_PARAM = 'state';

function isPrototypeState(value: string | null): value is PrototypeState {
  return value !== null && (PROTOTYPE_STATES as readonly string[]).includes(value);
}

export function usePrototypeState(): PrototypeState {
  const [searchParams] = useSearchParams();
  const value = searchParams.get(STATE_PARAM);
  return isPrototypeState(value) ? value : 'data';
}

export function useSetPrototypeState(): (next: PrototypeState) => void {
  const [searchParams, setSearchParams] = useSearchParams();

  return (next: PrototypeState) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'data') {
      params.delete(STATE_PARAM);
    } else {
      params.set(STATE_PARAM, next);
    }
    setSearchParams(params, { replace: true });
  };
}

export interface MockDataResult<T> {
  loading: boolean;
  error: string | null;
  data: T;
}

/**
 * Wraps a fixture in the currently selected state, with a small delay so
 * loading states are actually visible instead of flashing past.
 *
 * @param data       the fixture to return in the "data" state
 * @param emptyValue what "no results" looks like for this shape (often `[]`)
 */
export function useMockData<T>(data: T, emptyValue: T, delayMs = 600): MockDataResult<T> {
  const state = usePrototypeState();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);

    // The "loading" state deliberately never settles, so it can be inspected.
    if (state === 'loading') return;

    const timer = setTimeout(() => setSettled(true), delayMs);
    return () => clearTimeout(timer);
  }, [state, delayMs]);

  return {
    loading: !settled,
    error: settled && state === 'error' ? 'Something went wrong. Please try again.' : null,
    data: state === 'empty' ? emptyValue : data,
  };
}
