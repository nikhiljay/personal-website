"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import maplibregl from "maplibre-gl";
import type {
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";

import {
  getPlaceByStopId,
  manhattanNeighborhoods,
  mapBearing,
  mapBounds,
  mapHighlightIds,
  mapHighlights,
  tripStops,
} from "../lib/kavi-nyc-trip";
import type { Coordinates } from "../lib/geo";
import { savedSpots, type SavedSpot } from "../lib/nikhil-saved-spots";
import { citymapperDirectionsUrl } from "../lib/citymapper";
import {
  savedSpotKindColorExpression,
  savedSpotKindColors,
  type SavedSpotKind,
} from "../lib/saved-spot-kinds";

import "maplibre-gl/dist/maplibre-gl.css";

const STYLES: Record<"light" | "dark", string> = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const MAP_FIT_PADDING = {
  top: -10,
  bottom: 20,
  left: 10,
  right: 10,
};

const LABEL_FONT = ["Inter", "system-ui", "sans-serif"];
const MARKER_DOT_RADIUS = 5;
const SELECTED_MARKER_DOT_RADIUS = 6.5;
const VISITED_MARKER_IMAGE_PX = 24;
const VISITED_MARKER_INSET = 2;
const VISITED_MARKER_CORNER_RADIUS = 3;
const VISITED_MARKER_KINDS: SavedSpotKind[] = [
  "cafe",
  "casual",
  "nice",
  "bar",
  "activity",
];
const VISITED_ICON_SIZE =
  (MARKER_DOT_RADIUS * 2 + 1) / VISITED_MARKER_IMAGE_PX;
const SELECTED_VISITED_ICON_SIZE =
  (SELECTED_MARKER_DOT_RADIUS * 2 + 1) / VISITED_MARKER_IMAGE_PX;
const MOBILE_MARKER_HIT_PADDING = 16;
const HIGHLIGHT_RING_RADIUS = 8;
const MARKER_STROKE_WIDTH = 2;
const HIGHLIGHT_LABEL_SIZE = 11;
const HIGHLIGHT_LABEL_LETTER_SPACING = 0.01;
const CURRENT_LOCATION_LABEL_LETTER_SPACING = -0.02;
const HIGHLIGHT_LABEL_HALO_WIDTH = 1.5;
const HIGHLIGHT_LABEL_OFFSET: [number, number] = [0, 0.65];
const styleCache = new Map<string, StyleSpecification>();

const NEIGHBORHOODS_SOURCE = "neighborhoods";
const NEIGHBORHOOD_LABELS_LAYER = "neighborhood-labels";
const SAVED_SOURCE = "saved-spots";
const SAVED_VISITED_LAYER = "saved-spots-visited";
const SAVED_LAYER = "saved-spots-dot";
const STOPS_SOURCE = "trip-stops";
const STOPS_LAYER = "trip-stops-dot";
const HIGHLIGHT_SOURCE = "map-highlights";
const HIGHLIGHT_RING_LAYER = "map-highlights-ring";
const HIGHLIGHT_LAYER = "map-highlights-dot";
const HIGHLIGHT_SQUARE_LAYER = "map-highlights-square";
const HIGHLIGHT_LABELS_LAYER = "map-highlight-labels";

const MARKER_LAYERS = [
  SAVED_LAYER,
  SAVED_VISITED_LAYER,
  STOPS_LAYER,
  HIGHLIGHT_RING_LAYER,
  HIGHLIGHT_SQUARE_LAYER,
  HIGHLIGHT_LAYER,
  HIGHLIGHT_LABELS_LAYER,
] as const;

function markerHitPadding() {
  return window.matchMedia("(pointer: coarse)").matches
    ? MOBILE_MARKER_HIT_PADDING
    : 0;
}

function toScreenPoint(point: maplibregl.PointLike) {
  return Array.isArray(point) ? { x: point[0], y: point[1] } : point;
}

function queryMarkerFeatures(map: maplibregl.Map, point: maplibregl.PointLike) {
  const { x, y } = toScreenPoint(point);
  const padding = markerHitPadding();
  const features =
    padding > 0
      ? map.queryRenderedFeatures(
          [
            [x - padding, y - padding],
            [x + padding, y + padding],
          ],
          { layers: [...MARKER_LAYERS] },
        )
      : map.queryRenderedFeatures([x, y], { layers: [...MARKER_LAYERS] });

  if (features.length <= 1) {
    return features;
  }

  return [...features].sort((left, right) => {
    const distance = (feature: (typeof features)[number]) => {
      if (feature.geometry.type !== "Point") {
        return Number.POSITIVE_INFINITY;
      }

      const projected = map.project(
        feature.geometry.coordinates as [number, number],
      );
      const dx = projected.x - x;
      const dy = projected.y - y;
      return dx * dx + dy * dy;
    };

    return distance(left) - distance(right);
  });
}

async function ensureInterLoaded() {
  if (!("fonts" in document)) {
    return;
  }

  await Promise.all([
    document.fonts.load('400 11px "Inter"'),
    document.fonts.load('400 12px "Inter"'),
    document.fonts.load('500 13px "Inter"'),
  ]);
}

async function fetchMapStyle(url: string) {
  const cached = styleCache.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  const style = (await response.json()) as StyleSpecification;
  const { glyphs: _glyphs, ...styleWithoutGlyphs } = style;

  styleCache.set(url, styleWithoutGlyphs);
  return styleWithoutGlyphs;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function popupHtml(place: {
  name: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
  photo?: string;
}) {
  const note = place.note
    ? `<div class="trip-map-popup-note">${escapeHtml(place.note)}</div>`
    : "";
  const photo = place.photo
    ? `<div class="trip-map-popup-photo"><img src="${escapeHtml(place.photo)}" alt="" width="112" height="149" loading="lazy" decoding="async" /></div>`
    : "";
  const citymapperUrl = citymapperDirectionsUrl(place);

  return `
    <div>
      <div class="trip-map-popup-header">
        <div class="trip-map-popup-title">${escapeHtml(place.name)}</div>
        <a class="trip-map-popup-citymapper" href="${escapeHtml(citymapperUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(place.name)} in Citymapper">
          <img src="/images/citymapper-icon.png" alt="" width="18" height="18" />
        </a>
      </div>
      <div class="trip-map-popup-address">${escapeHtml(place.address)}</div>
      ${note}
      ${photo}
    </div>
  `;
}

function neighborhoodsGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: manhattanNeighborhoods.map((neighborhood) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [neighborhood.lng, neighborhood.lat],
      },
      properties: {
        id: neighborhood.id,
        name: neighborhood.name,
      },
    })),
  };
}

function savedSpotsGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: savedSpots.map((spot) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [spot.lng, spot.lat],
      },
      properties: {
        id: spot.id,
        name: spot.name,
        address: spot.address,
        kind: spot.kind,
        ...(spot.note ? { note: spot.note } : {}),
        ...(spot.photo ? { photo: spot.photo } : {}),
        ...(spot.visited ? { visited: true } : {}),
      },
    })),
  };
}

function stopsGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: tripStops
      .filter((stop) => !mapHighlightIds.has(stop.id))
      .map((stop) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [stop.lng, stop.lat],
        },
        properties: {
          id: stop.id,
          name: stop.name,
          address: stop.address,
        },
      })),
  };
}

function highlightsGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: mapHighlights.map((place) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [place.lng, place.lat],
      },
      properties: {
        id: place.id,
        name: place.name,
        address: place.address,
        fill: place.fill,
        ring: place.ring,
        ...(place.shape ? { shape: place.shape } : {}),
      },
    })),
  };
}

function labelColors(theme: "light" | "dark") {
  return theme === "dark"
    ? {
        neighborhood: "#a0a0a0",
        halo: "#1a1a1a",
        ring: "rgba(242, 242, 242, 0.22)",
        fill: "#f2f2f2",
        stroke: "#1a1a1a",
      }
    : {
        neighborhood: "#737373",
        halo: "#ffffff",
        ring: "rgba(17, 17, 17, 0.18)",
        fill: "#111111",
        stroke: "#ffffff",
      };
}

function fitMapBounds(map: maplibregl.Map) {
  map.fitBounds(mapBounds, {
    padding: MAP_FIT_PADDING,
    animate: false,
    bearing: mapBearing,
  });
}

function hideBasemapLabels(map: maplibregl.Map) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== "symbol" || !layer.layout?.["text-field"]) {
      continue;
    }

    try {
      map.setLayoutProperty(layer.id, "visibility", "none");
    } catch {
      // Ignore layers that can't be hidden.
    }
  }
}

function setupNeighborhoodLayers(map: maplibregl.Map, theme: "light" | "dark") {
  const colors = labelColors(theme);

  if (map.getSource(NEIGHBORHOODS_SOURCE)) {
    (map.getSource(NEIGHBORHOODS_SOURCE) as GeoJSONSource).setData(
      neighborhoodsGeoJson(),
    );
    map.setPaintProperty(
      NEIGHBORHOOD_LABELS_LAYER,
      "text-color",
      colors.neighborhood,
    );
    map.setPaintProperty(
      NEIGHBORHOOD_LABELS_LAYER,
      "text-halo-color",
      colors.halo,
    );
    return;
  }

  map.addSource(NEIGHBORHOODS_SOURCE, {
    type: "geojson",
    data: neighborhoodsGeoJson(),
  });

  map.addLayer({
    id: NEIGHBORHOOD_LABELS_LAYER,
    type: "symbol",
    source: NEIGHBORHOODS_SOURCE,
    layout: {
      "text-field": ["get", "name"],
      "text-font": LABEL_FONT,
      "text-size": 12,
      "text-letter-spacing": 0.03,
      "text-max-width": 8,
      "text-anchor": "center",
    },
    paint: {
      "text-color": colors.neighborhood,
      "text-halo-color": colors.halo,
      "text-halo-width": 1.5,
    },
  });
}

function visitedMarkerImageId(kind: SavedSpotKind, theme: "light" | "dark") {
  return `saved-visited-${kind}-${theme}`;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function createVisitedSquareImage(fill: string, stroke: string) {
  const size = VISITED_MARKER_IMAGE_PX;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create visited marker canvas");
  }

  const side = size - VISITED_MARKER_INSET * 2;

  roundRectPath(
    ctx,
    VISITED_MARKER_INSET,
    VISITED_MARKER_INSET,
    side,
    side,
    VISITED_MARKER_CORNER_RADIUS,
  );
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = MARKER_STROKE_WIDTH;
  ctx.lineJoin = "round";
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

function ensureVisitedMarkerImages(map: maplibregl.Map, theme: "light" | "dark") {
  const colors = savedSpotKindColors[theme];
  const stroke = labelColors(theme).stroke;

  for (const legacyId of ["saved-visited-square", "saved-visited-square-v2"]) {
    if (map.hasImage(legacyId)) {
      map.removeImage(legacyId);
    }
  }

  for (const kind of VISITED_MARKER_KINDS) {
    const id = visitedMarkerImageId(kind, theme);
    if (map.hasImage(id)) {
      map.removeImage(id);
    }

    map.addImage(id, createVisitedSquareImage(colors[kind], stroke));
  }
}

function visitedMarkerImageExpression(theme: "light" | "dark"): ExpressionSpecification {
  return [
    "match",
    ["get", "kind"],
    "cafe",
    visitedMarkerImageId("cafe", theme),
    "casual",
    visitedMarkerImageId("casual", theme),
    "nice",
    visitedMarkerImageId("nice", theme),
    "bar",
    visitedMarkerImageId("bar", theme),
    "activity",
    visitedMarkerImageId("activity", theme),
    visitedMarkerImageId("cafe", theme),
  ];
}

function visitedSquareLayerLayout(
  theme: "light" | "dark",
  iconSize: number = VISITED_ICON_SIZE,
): maplibregl.SymbolLayerSpecification["layout"] {
  return {
    "icon-image": visitedMarkerImageExpression(theme),
    "icon-size": iconSize,
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  };
}

function squareHighlights() {
  return mapHighlights.filter((place) => place.shape === "square");
}

function highlightSquareImageId(id: string, theme: "light" | "dark") {
  return `highlight-square-${id}-${theme}`;
}

function ensureHighlightSquareImages(map: maplibregl.Map, theme: "light" | "dark") {
  const stroke = labelColors(theme).stroke;

  for (const place of squareHighlights()) {
    const imageId = highlightSquareImageId(place.id, theme);
    if (map.hasImage(imageId)) {
      map.removeImage(imageId);
    }

    map.addImage(imageId, createVisitedSquareImage(place.fill, stroke));
  }
}

function highlightSquareImageExpression(
  theme: "light" | "dark",
): ExpressionSpecification {
  return [
    "match",
    ["get", "id"],
    "shobha-home",
    highlightSquareImageId("shobha-home", theme),
    highlightSquareImageId("shobha-home", theme),
  ];
}

function highlightSquareLayerLayout(
  theme: "light" | "dark",
): maplibregl.SymbolLayerSpecification["layout"] {
  return {
    "icon-image": highlightSquareImageExpression(theme),
    "icon-size": VISITED_ICON_SIZE,
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  };
}

function ensureHighlightSquareLayer(map: maplibregl.Map, theme: "light" | "dark") {
  ensureHighlightSquareImages(map, theme);

  if (!map.getSource(HIGHLIGHT_SOURCE)) {
    return;
  }

  if (map.getLayer(HIGHLIGHT_SQUARE_LAYER)) {
    map.setLayoutProperty(
      HIGHLIGHT_SQUARE_LAYER,
      "icon-image",
      highlightSquareImageExpression(theme),
    );
    return;
  }

  map.addLayer(
    {
      id: HIGHLIGHT_SQUARE_LAYER,
      type: "symbol",
      source: HIGHLIGHT_SOURCE,
      filter: ["==", ["get", "shape"], "square"],
      layout: highlightSquareLayerLayout(theme),
    },
    HIGHLIGHT_LAYER,
  );
}

function savedSpotLayerFilter(
  visited: boolean,
  activeKinds: SavedSpotKind[],
): FilterSpecification {
  const visitedFilter: FilterSpecification = visited
    ? ["==", ["get", "visited"], true]
    : ["!=", ["get", "visited"], true];

  if (activeKinds.length === 0) {
    return visitedFilter;
  }

  return [
    "all",
    visitedFilter,
    ["in", ["get", "kind"], ["literal", activeKinds]],
  ];
}

function applySavedSpotKindFilter(
  map: maplibregl.Map,
  activeKinds: SavedSpotKind[],
) {
  if (!map.getLayer(SAVED_LAYER)) {
    return;
  }

  map.setFilter(SAVED_LAYER, savedSpotLayerFilter(false, activeKinds));

  if (map.getLayer(SAVED_VISITED_LAYER)) {
    map.setFilter(SAVED_VISITED_LAYER, savedSpotLayerFilter(true, activeKinds));
  }

  applyTripStopsVisibility(map, activeKinds);
}

function applyTripStopsVisibility(
  map: maplibregl.Map,
  activeKinds: SavedSpotKind[],
) {
  if (!map.getLayer(STOPS_LAYER)) {
    return;
  }

  map.setLayoutProperty(
    STOPS_LAYER,
    "visibility",
    activeKinds.length === 0 ? "visible" : "none",
  );
}

function applySavedSpotSelection(
  map: maplibregl.Map,
  selectedId: string | null,
) {
  if (!map.getLayer(SAVED_LAYER)) {
    return;
  }

  const match = selectedId ?? "";

  map.setPaintProperty(SAVED_LAYER, "circle-radius", [
    "case",
    ["==", ["get", "id"], match],
    SELECTED_MARKER_DOT_RADIUS,
    MARKER_DOT_RADIUS,
  ]);
  map.setPaintProperty(SAVED_LAYER, "circle-stroke-width", [
    "case",
    ["==", ["get", "id"], match],
    2.5,
    MARKER_STROKE_WIDTH,
  ]);

  if (map.getLayer(SAVED_VISITED_LAYER)) {
    map.setLayoutProperty(SAVED_VISITED_LAYER, "icon-size", [
      "case",
      ["==", ["get", "id"], match],
      SELECTED_VISITED_ICON_SIZE,
      VISITED_ICON_SIZE,
    ]);
  }
}

function ensureSavedVisitedLayer(
  map: maplibregl.Map,
  theme: "light" | "dark",
) {
  ensureVisitedMarkerImages(map, theme);

  if (map.getLayer(SAVED_VISITED_LAYER)) {
    map.setLayoutProperty(
      SAVED_VISITED_LAYER,
      "icon-image",
      visitedMarkerImageExpression(theme),
    );
    return;
  }

  if (!map.getSource(SAVED_SOURCE)) {
    return;
  }

  map.addLayer(
    {
      id: SAVED_VISITED_LAYER,
      type: "symbol",
      source: SAVED_SOURCE,
      filter: ["==", ["get", "visited"], true],
      layout: visitedSquareLayerLayout(theme),
    },
    SAVED_LAYER,
  );
}

function setupSavedSpotLayers(
  map: maplibregl.Map,
  theme: "light" | "dark",
  selectedId: string | null,
  activeKinds: SavedSpotKind[],
) {
  const colors = labelColors(theme);
  const kindColors = savedSpotKindColorExpression(
    theme,
  ) as ExpressionSpecification;

  if (map.getSource(SAVED_SOURCE)) {
    (map.getSource(SAVED_SOURCE) as GeoJSONSource).setData(savedSpotsGeoJson());
    applySavedSpotKindFilter(map, activeKinds);
    map.setPaintProperty(SAVED_LAYER, "circle-color", kindColors);
    map.setPaintProperty(SAVED_LAYER, "circle-stroke-color", colors.stroke);
    ensureSavedVisitedLayer(map, theme);
    applySavedSpotSelection(map, selectedId);
    return;
  }

  map.addSource(SAVED_SOURCE, {
    type: "geojson",
    data: savedSpotsGeoJson(),
  });

  ensureVisitedMarkerImages(map, theme);

  map.addLayer({
    id: SAVED_VISITED_LAYER,
    type: "symbol",
    source: SAVED_SOURCE,
    filter: savedSpotLayerFilter(true, activeKinds),
    layout: visitedSquareLayerLayout(theme),
  });

  map.addLayer({
    id: SAVED_LAYER,
    type: "circle",
    source: SAVED_SOURCE,
    filter: savedSpotLayerFilter(false, activeKinds),
    paint: {
      "circle-radius": MARKER_DOT_RADIUS,
      "circle-color": kindColors,
      "circle-stroke-width": MARKER_STROKE_WIDTH,
      "circle-stroke-color": colors.stroke,
    },
  });

  applySavedSpotSelection(map, selectedId);
}

function setupStopLayers(
  map: maplibregl.Map,
  theme: "light" | "dark",
  activeKinds: SavedSpotKind[],
) {
  const colors = labelColors(theme);
  const data = stopsGeoJson();

  if (map.getSource(STOPS_SOURCE)) {
    (map.getSource(STOPS_SOURCE) as GeoJSONSource).setData(data);
    map.setPaintProperty(STOPS_LAYER, "circle-color", colors.fill);
    map.setPaintProperty(STOPS_LAYER, "circle-radius", MARKER_DOT_RADIUS);
    map.setPaintProperty(STOPS_LAYER, "circle-stroke-width", MARKER_STROKE_WIDTH);
    map.setPaintProperty(STOPS_LAYER, "circle-stroke-color", colors.stroke);
    applyTripStopsVisibility(map, activeKinds);
    return;
  }

  map.addSource(STOPS_SOURCE, {
    type: "geojson",
    data,
  });

  map.addLayer({
    id: STOPS_LAYER,
    type: "circle",
    source: STOPS_SOURCE,
    paint: {
      "circle-radius": MARKER_DOT_RADIUS,
      "circle-color": colors.fill,
      "circle-stroke-width": MARKER_STROKE_WIDTH,
      "circle-stroke-color": colors.stroke,
    },
  });

  applyTripStopsVisibility(map, activeKinds);
}

function setupHighlightLayers(map: maplibregl.Map, theme: "light" | "dark") {
  const colors = labelColors(theme);
  const data = highlightsGeoJson();

  if (map.getSource(HIGHLIGHT_SOURCE)) {
    (map.getSource(HIGHLIGHT_SOURCE) as GeoJSONSource).setData(data);
    map.setFilter(HIGHLIGHT_LAYER, ["!=", ["get", "shape"], "square"]);
    map.setPaintProperty(HIGHLIGHT_RING_LAYER, "circle-radius", HIGHLIGHT_RING_RADIUS);
    map.setPaintProperty(HIGHLIGHT_LAYER, "circle-radius", MARKER_DOT_RADIUS);
    map.setPaintProperty(HIGHLIGHT_LAYER, "circle-stroke-width", MARKER_STROKE_WIDTH);
    map.setPaintProperty(HIGHLIGHT_LAYER, "circle-stroke-color", colors.stroke);
    ensureHighlightSquareLayer(map, theme);
    map.setLayoutProperty(
      HIGHLIGHT_LABELS_LAYER,
      "text-size",
      HIGHLIGHT_LABEL_SIZE,
    );
    map.setLayoutProperty(
      HIGHLIGHT_LABELS_LAYER,
      "text-offset",
      HIGHLIGHT_LABEL_OFFSET,
    );
    map.setPaintProperty(HIGHLIGHT_LABELS_LAYER, "text-halo-color", colors.halo);
    return;
  }

  map.addSource(HIGHLIGHT_SOURCE, {
    type: "geojson",
    data,
  });

  map.addLayer({
    id: HIGHLIGHT_RING_LAYER,
    type: "circle",
    source: HIGHLIGHT_SOURCE,
    paint: {
      "circle-radius": HIGHLIGHT_RING_RADIUS,
      "circle-color": ["get", "ring"],
      "circle-opacity": 1,
    },
  });

  map.addLayer({
    id: HIGHLIGHT_LAYER,
    type: "circle",
    source: HIGHLIGHT_SOURCE,
    filter: ["!=", ["get", "shape"], "square"],
    paint: {
      "circle-radius": MARKER_DOT_RADIUS,
      "circle-color": ["get", "fill"],
      "circle-stroke-width": MARKER_STROKE_WIDTH,
      "circle-stroke-color": colors.stroke,
    },
  });

  ensureHighlightSquareLayer(map, theme);

  map.addLayer({
    id: HIGHLIGHT_LABELS_LAYER,
    type: "symbol",
    source: HIGHLIGHT_SOURCE,
    layout: {
      "text-field": ["get", "name"],
      "text-font": LABEL_FONT,
      "text-size": HIGHLIGHT_LABEL_SIZE,
      "text-offset": HIGHLIGHT_LABEL_OFFSET,
      "text-anchor": "top",
      "text-max-width": 10,
      "text-letter-spacing": HIGHLIGHT_LABEL_LETTER_SPACING,
    },
    paint: {
      "text-color": ["get", "fill"],
      "text-halo-color": colors.halo,
      "text-halo-width": HIGHLIGHT_LABEL_HALO_WIDTH,
    },
  });
}

function createCurrentLocationMarkerElement() {
  const marker = document.createElement("div");
  marker.className = "trip-map-current-location";
  marker.setAttribute("aria-hidden", "true");
  marker.style.setProperty(
    "--location-label-size",
    `${HIGHLIGHT_LABEL_SIZE}px`,
  );
  marker.style.setProperty(
    "--location-label-tracking",
    `${CURRENT_LOCATION_LABEL_LETTER_SPACING}em`,
  );
  marker.style.setProperty(
    "--location-label-offset",
    `${HIGHLIGHT_LABEL_OFFSET[1]}em`,
  );
  marker.style.setProperty(
    "--location-label-halo",
    `${HIGHLIGHT_LABEL_HALO_WIDTH * 2}px`,
  );

  const ring = document.createElement("span");
  ring.className = "trip-map-current-location-ring";

  const dot = document.createElement("span");
  dot.className = "trip-map-current-location-dot";

  const label = document.createElement("span");
  label.className = "trip-map-current-location-label";
  label.textContent = "Kavi";

  ring.append(dot);
  marker.append(ring, label);
  return marker;
}

function syncCurrentLocationMarker(
  map: maplibregl.Map,
  markerRef: RefObject<maplibregl.Marker | null>,
  location: Coordinates | null,
) {
  if (!location) {
    markerRef.current?.remove();
    markerRef.current = null;
    return;
  }

  const nextPosition: [number, number] = [location.lng, location.lat];

  if (markerRef.current) {
    markerRef.current.setLngLat(nextPosition);
    return;
  }

  markerRef.current = new maplibregl.Marker({
    element: createCurrentLocationMarkerElement(),
    anchor: "center",
  })
    .setLngLat(nextPosition)
    .addTo(map);
}

export function TripMap({
  selectedSavedSpotId = null,
  onSavedSpotSelect,
  selectedStopId = null,
  onStopSelect,
  activeSavedSpotKinds = [],
  currentLocation = null,
  onReady,
  embedded = false,
  shellRef: shellRefProp,
}: {
  selectedSavedSpotId?: string | null;
  onSavedSpotSelect?: (id: string | null) => void;
  selectedStopId?: string | null;
  onStopSelect?: (id: string | null) => void;
  activeSavedSpotKinds?: SavedSpotKind[];
  currentLocation?: Coordinates | null;
  onReady?: () => void;
  embedded?: boolean;
  shellRef?: RefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalShellRef = useRef<HTMLDivElement>(null);
  const shellRef = shellRefProp ?? internalShellRef;
  const mapRef = useRef<maplibregl.Map | null>(null);
  const themeRef = useRef<"light" | "dark">("light");
  const selectedSavedSpotIdRef = useRef(selectedSavedSpotId);
  const selectedStopIdRef = useRef(selectedStopId);
  const activeSavedSpotKindsRef = useRef(activeSavedSpotKinds);
  const currentLocationRef = useRef(currentLocation);
  const currentLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const onSavedSpotSelectRef = useRef(onSavedSpotSelect);
  const onStopSelectRef = useRef(onStopSelect);
  const onReadyRef = useRef(onReady);
  const hasCalledReadyRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  selectedSavedSpotIdRef.current = selectedSavedSpotId;
  selectedStopIdRef.current = selectedStopId;
  activeSavedSpotKindsRef.current = activeSavedSpotKinds;
  currentLocationRef.current = currentLocation;
  onSavedSpotSelectRef.current = onSavedSpotSelect;
  onStopSelectRef.current = onStopSelect;
  onReadyRef.current = onReady;

  const showPlacePopup = useCallback(
    (
      coordinates: [number, number],
      properties: { name: string; address: string; note?: string; photo?: string },
    ) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      const [lng, lat] = coordinates;

      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({
        offset: 12,
        closeButton: false,
        className: "trip-map-popup",
      })
        .setLngLat(coordinates)
        .setHTML(popupHtml({ ...properties, lat, lng }))
        .addTo(map);
    },
    [],
  );

  const focusSavedSpot = useCallback(
    (spotId: string | null, { scroll = false }: { scroll?: boolean } = {}) => {
      const map = mapRef.current;
      if (!map || !spotId) {
        return;
      }

      const spot = savedSpots.find((entry) => entry.id === spotId);
      if (!spot) {
        return;
      }

      applySavedSpotSelection(map, spotId);
      if (scroll) {
        shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      map.flyTo({
        center: [spot.lng, spot.lat],
        zoom: Math.max(map.getZoom(), 14),
        bearing: mapBearing,
        duration: 700,
        essential: true,
      });
      showPlacePopup([spot.lng, spot.lat], spot);
    },
    [showPlacePopup],
  );

  const focusStop = useCallback(
    (stopId: string | null, { scroll = false }: { scroll?: boolean } = {}) => {
      const map = mapRef.current;
      if (!map || !stopId) {
        return;
      }

      const place = getPlaceByStopId(stopId);
      if (!place) {
        return;
      }

      if (scroll) {
        shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      map.flyTo({
        center: [place.lng, place.lat],
        zoom: Math.max(map.getZoom(), 14),
        bearing: mapBearing,
        duration: 700,
        essential: true,
      });
      showPlacePopup([place.lng, place.lat], place);
    },
    [showPlacePopup],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    applySavedSpotSelection(map, selectedSavedSpotId);

    if (selectedSavedSpotId) {
      focusSavedSpot(selectedSavedSpotId, { scroll: true });
    } else if (selectedStopId) {
      focusStop(selectedStopId, { scroll: true });
    } else {
      popupRef.current?.remove();
      popupRef.current = null;
    }
  }, [selectedSavedSpotId, selectedStopId, focusSavedSpot, focusStop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    applySavedSpotKindFilter(map, activeSavedSpotKinds);
  }, [activeSavedSpotKinds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) {
      return;
    }

    syncCurrentLocationMarker(
      map,
      currentLocationMarkerRef,
      currentLocation,
    );
  }, [currentLocation, mapLoaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let interactionsBound = false;

    const showStopPopup = (
      coordinates: [number, number],
      properties: { name: string; address: string; note?: string; photo?: string },
    ) => {
      showPlacePopup(coordinates, properties);
    };

    const bindInteractions = () => {
      const map = mapRef.current;
      if (!map || interactionsBound) {
        return;
      }

      interactionsBound = true;

      const onPlaceClick = (event: MapLayerMouseEvent) => {
        const map = mapRef.current;
        if (!map) {
          return;
        }

        const features = queryMarkerFeatures(map, event.point);
        const feature = features[0];
        if (!feature || feature.geometry.type !== "Point") {
          return;
        }

        const layerId = feature.layer?.id;
        const properties = feature.properties as {
          id?: string;
          name: string;
          address: string;
          note?: string;
          photo?: string;
        };

        if (layerId === SAVED_LAYER || layerId === SAVED_VISITED_LAYER) {
          const nextId =
            properties.id === selectedSavedSpotIdRef.current
              ? null
              : (properties.id ?? null);
          onSavedSpotSelectRef.current?.(nextId);
        } else if (
          (layerId === STOPS_LAYER ||
            layerId === HIGHLIGHT_LAYER ||
            layerId === HIGHLIGHT_SQUARE_LAYER ||
            layerId === HIGHLIGHT_RING_LAYER ||
            layerId === HIGHLIGHT_LABELS_LAYER) &&
          properties.id
        ) {
          const nextId =
            properties.id === selectedStopIdRef.current
              ? null
              : properties.id;
          onStopSelectRef.current?.(nextId);
        } else {
          return;
        }

        showStopPopup(
          feature.geometry.coordinates.slice() as [number, number],
          properties,
        );
      };

      map.on("click", onPlaceClick);

      for (const layer of [
        SAVED_LAYER,
        SAVED_VISITED_LAYER,
        STOPS_LAYER,
        HIGHLIGHT_RING_LAYER,
        HIGHLIGHT_SQUARE_LAYER,
        HIGHLIGHT_LAYER,
        HIGHLIGHT_LABELS_LAYER,
      ]) {
        map.on("mouseenter", layer, () => {
          map?.getCanvas().style.setProperty("cursor", "pointer");
        });
        map.on("mouseleave", layer, () => {
          map?.getCanvas().style.removeProperty("cursor");
        });
      }
    };

    const onMapReady = () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      hideBasemapLabels(map);
      setupNeighborhoodLayers(map, themeRef.current);
      setupSavedSpotLayers(
        map,
        themeRef.current,
        selectedSavedSpotIdRef.current,
        activeSavedSpotKindsRef.current,
      );
      setupStopLayers(map, themeRef.current, activeSavedSpotKindsRef.current);
      setupHighlightLayers(map, themeRef.current);
      setMapLoaded(true);
      bindInteractions();

      map.getCanvas().setAttribute("tabindex", "-1");

      if (selectedSavedSpotIdRef.current) {
        focusSavedSpot(selectedSavedSpotIdRef.current);
      }

      map.once("idle", () => {
        if (!hasCalledReadyRef.current) {
          hasCalledReadyRef.current = true;
          onReadyRef.current?.();
        }
      });
    };

    const init = async () => {
      void ensureInterLoaded();

      const style = await fetchMapStyle(STYLES[themeRef.current]);
      if (cancelled) {
        return;
      }

      const map = new maplibregl.Map({
        container,
        style,
        bounds: mapBounds,
        fitBoundsOptions: {
          padding: MAP_FIT_PADDING,
          animate: false,
          bearing: mapBearing,
        },
        bearing: mapBearing,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });

      mapRef.current = map;

      map.on("load", onMapReady);
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    themeRef.current = media.matches ? "dark" : "light";

    void init();

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    resizeObserver.observe(container);

    const updateTheme = async (nextTheme: "light" | "dark") => {
      const map = mapRef.current;
      if (!map || nextTheme === themeRef.current) {
        return;
      }

      themeRef.current = nextTheme;
      popupRef.current?.remove();
      popupRef.current = null;

      const style = await fetchMapStyle(STYLES[nextTheme]);
      if (cancelled || !mapRef.current) {
        return;
      }

      map.setStyle(style);
      map.once("load", () => {
        const activeMap = mapRef.current;
        if (!activeMap) {
          return;
        }

        void (() => {
          hideBasemapLabels(activeMap);
          setupNeighborhoodLayers(activeMap, nextTheme);
          setupSavedSpotLayers(
            activeMap,
            nextTheme,
            selectedSavedSpotIdRef.current,
            activeSavedSpotKindsRef.current,
          );
          setupStopLayers(activeMap, nextTheme, activeSavedSpotKindsRef.current);
          setupHighlightLayers(activeMap, nextTheme);
          syncCurrentLocationMarker(
            activeMap,
            currentLocationMarkerRef,
            currentLocationRef.current,
          );
          fitMapBounds(activeMap);
        })();
      });
    };

    const onThemeChange = (event: MediaQueryListEvent) => {
      void updateTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", onThemeChange);

    return () => {
      cancelled = true;
      setMapLoaded(false);
      media.removeEventListener("change", onThemeChange);
      resizeObserver.disconnect();
      currentLocationMarkerRef.current?.remove();
      currentLocationMarkerRef.current = null;
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [focusSavedSpot, showPlacePopup]);

  return embedded ? (
    <div ref={containerRef} className="size-full" />
  ) : (
    <div ref={internalShellRef} className="trip-map-shell overflow-hidden">
      <div ref={containerRef} className="h-[min(480px,68vh)] w-full" />
    </div>
  );
}
