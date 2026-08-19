import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Whether the fake admin chrome (Frame/TopBar/Navigation) is rendered.
 *
 * Prototypes need to know this because a few Polaris components only work
 * inside a Frame — ContextualSaveBar renders into the frame's slot, so it has
 * nothing to attach to when the chrome is hidden.
 */

const CHROME_PARAM = 'chrome';

export function useChromeHidden(): boolean {
  const [searchParams] = useSearchParams();
  return searchParams.get(CHROME_PARAM) === 'off';
}

export function useSetChromeHidden(): (hidden: boolean) => void {
  const [searchParams, setSearchParams] = useSearchParams();

  return useCallback(
    (hidden: boolean) => {
      const params = new URLSearchParams(searchParams);
      if (hidden) {
        params.set(CHROME_PARAM, 'off');
      } else {
        params.delete(CHROME_PARAM);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );
}
