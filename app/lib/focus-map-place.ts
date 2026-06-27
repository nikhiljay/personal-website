export type FocusMapPlaceDetail =
  | { type: "saved-spot"; spotId: string }
  | {
      type: "place";
      lat: number;
      lng: number;
      name: string;
      address: string;
      note?: string;
      photo?: string;
    };

export const FOCUS_MAP_PLACE_EVENT = "kavi-trip:focus-place";

export function focusMapPlace(detail: FocusMapPlaceDetail) {
  window.dispatchEvent(
    new CustomEvent<FocusMapPlaceDetail>(FOCUS_MAP_PLACE_EVENT, { detail }),
  );
}
