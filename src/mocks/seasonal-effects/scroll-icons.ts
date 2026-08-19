/**
 * The 30 scroll-to-top button icons, drawn as SVG paths.
 *
 * Not unicode arrows: those render differently on every platform and a few of
 * them turn into colour emoji, which is exactly wrong for a button the merchant
 * has already picked a colour for. `strokeWidth: 0` means the path is filled
 * instead of stroked. Both use `currentColor`, so one icon works on a light and
 * a dark button.
 */

export interface ScrollIcon {
  id: string;
  /** 0 = filled path, anything else = stroked at that width. */
  strokeWidth: number;
  /** Path data inside a 24x24 viewBox. */
  path: string;
}

/** The default, and the fallback for an id that no longer exists. */
const FIRST_ICON: ScrollIcon = {
  id: 'icon-1',
  strokeWidth: 1.5,
  path: '<path d="M6 15l6-6 6 6"/>',
};

export const scrollIcons: ScrollIcon[] = [
  { id: 'icon-1', strokeWidth: 1.5, path: '<path d="M6 15l6-6 6 6"/>' },
  { id: 'icon-2', strokeWidth: 3, path: '<path d="M6 15l6-6 6 6"/>' },
  { id: 'icon-3', strokeWidth: 2, path: '<path d="M6 17l6-6 6 6M6 11l6-6 6 6"/>' },
  { id: 'icon-4', strokeWidth: 1.7, path: '<path d="M6 19l6-5 6 5M6 14l6-5 6 5M6 9l6-5 6 5"/>' },
  { id: 'icon-5', strokeWidth: 2, path: '<path d="M12 20V5M12 5l-5 5M12 5l5 5"/>' },
  { id: 'icon-6', strokeWidth: 1.4, path: '<path d="M12 20V5M12 5l-5 5M12 5l5 5"/>' },
  { id: 'icon-7', strokeWidth: 3, path: '<path d="M12 20V5M12 5l-5 5M12 5l5 5"/>' },
  { id: 'icon-8', strokeWidth: 2, path: '<path d="M12 20V8M12 8l-4 4M12 8l4 4M5 5h14"/>' },
  { id: 'icon-9', strokeWidth: 2, path: '<path d="M12 19V6M12 6l-5 5M12 6l5 5M6 21h12"/>' },
  { id: 'icon-10', strokeWidth: 0, path: '<path d="M12 6l7 12H5z" fill="currentColor" stroke="none"/>' },
  { id: 'icon-11', strokeWidth: 2, path: '<path d="M12 6l7 12H5z"/>' },
  { id: 'icon-12', strokeWidth: 0, path: '<path d="M12 9l5 8H7z" fill="currentColor" stroke="none"/>' },
  { id: 'icon-13', strokeWidth: 0, path: '<path d="M12 4l7 8h-4v8h-6v-8H5z" fill="currentColor" stroke="none"/>' },
  { id: 'icon-14', strokeWidth: 1.8, path: '<path d="M12 4l7 8h-4v8h-6v-8H5z"/>' },
  { id: 'icon-15', strokeWidth: 1.8, path: '<circle cx="12" cy="12" r="8"/><path d="M8.5 13.5l3.5-3.5 3.5 3.5"/>' },
  { id: 'icon-16', strokeWidth: 1.8, path: '<circle cx="12" cy="12" r="8"/><path d="M12 16V8.5M12 8.5l-3 3M12 8.5l3 3"/>' },
  { id: 'icon-17', strokeWidth: 1.8, path: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 16V9M12 9l-3 3M12 9l3 3"/>' },
  { id: 'icon-18', strokeWidth: 1.8, path: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M8.5 13.5l3.5-3.5 3.5 3.5"/>' },
  { id: 'icon-19', strokeWidth: 2, path: '<path d="M12 5l-5 5M12 5l5 5M12 7v3M12 13v3M12 19v2"/>' },
  { id: 'icon-20', strokeWidth: 2, path: '<path d="M12 5l-5 5M12 5l5 5"/><circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="21" r="1" fill="currentColor" stroke="none"/>' },
  { id: 'icon-21', strokeWidth: 1.8, path: '<path d="M8 20V7M8 7l-3 3M8 7l3 3M16 20V7M16 7l-3 3M16 7l3 3"/>' },
  { id: 'icon-22', strokeWidth: 1.8, path: '<path d="M12 21v-9M12 12l-3 3M12 12l3 3"/><path d="M5 9a10 10 0 0 1 14 0"/>' },
  { id: 'icon-23', strokeWidth: 1.8, path: '<path d="M12 4l4 4H8zM6 12h12M5 16h14M4 20h16"/>' },
  { id: 'icon-24', strokeWidth: 1.8, path: '<path d="M5 21h14M5 3h14M12 17V8M12 8l-3 3M12 8l3 3"/>' },
  { id: 'icon-25', strokeWidth: 1.4, path: '<path d="M12 21V3M12 3l-4 4M12 3l4 4"/>' },
  { id: 'icon-26', strokeWidth: 3, path: '<path d="M12 17V9M12 9l-4 4M12 9l4 4"/>' },
  { id: 'icon-27', strokeWidth: 2, path: '<path d="M5 5h14M7 18l5-5 5 5"/>' },
  { id: 'icon-28', strokeWidth: 2.4, path: '<path d="M4 16l8-7 8 7"/>' },
  { id: 'icon-29', strokeWidth: 2, path: '<circle cx="12" cy="7" r="3" fill="currentColor" stroke="none"/><path d="M12 20v-9"/>' },
  { id: 'icon-30', strokeWidth: 1.8, path: '<path d="M5 4h14M6 20l6-5 6 5M6 14l6-5 6 5"/>' },
];

export const scrollIconById = (id: string): ScrollIcon =>
  scrollIcons.find((icon) => icon.id === id) ?? FIRST_ICON;
