"use client";

import { useCallback, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSONSource, MapLayerMouseEvent, StyleSpecification } from "maplibre-gl";

import {
  getPlaceByStopId,
  manhattanNeighborhoods,
  mapBearing,
  mapBounds,
  mapHighlightIds,
  mapHighlights,
  tripStops,
  type MapHighlight,
  type TripStop,
} from "../lib/ahla-nyc-trip";
import { savedSpots, type SavedSpot } from "../lib/nikhil-saved-spots";
import { savedSpotKindColorExpression } from "../lib/saved-spot-kinds";

import "maplibre-gl/dist/maplibre-gl.css";
import "./trip-map.css";

const STYLES: Record<"light" | "dark", string> = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const LABEL_FONT = ["Inter", "system-ui", "sans-serif"];
const MARKER_DOT_RADIUS = 5;
const HIGHLIGHT_RING_RADIUS = 8;
const MARKER_STROKE_WIDTH = 2;
const HIGHLIGHT_LABEL_SIZE = 11;
const HIGHLIGHT_LABEL_OFFSET: [number, number] = [0, 0.65];
const styleCache = new Map<string, StyleSpecification>();

const NEIGHBORHOODS_SOURCE = "neighborhoods";
const NEIGHBORHOOD_LABELS_LAYER = "neighborhood-labels";
const SAVED_SOURCE = "saved-spots";
const SAVED_LAYER = "saved-spots-dot";
const STOPS_SOURCE = "trip-stops";
const STOPS_LAYER = "trip-stops-dot";
const HIGHLIGHT_SOURCE = "map-highlights";
const HIGHLIGHT_RING_LAYER = "map-highlights-ring";
const HIGHLIGHT_LAYER = "map-highlights-dot";
const HIGHLIGHT_LABELS_LAYER = "map-highlight-labels";

async function ensureInterLoaded() {
  if (!("fonts" in document)) {
    return;
  }

  await Promise.all([
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

function popupHtml(place: Pick<TripStop | SavedSpot | MapHighlight, "name" | "address">) {
  return `
    <div>
      <div class="trip-map-popup-title">${place.name}</div>
      <div class="trip-map-popup-address">${place.address}</div>
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
    padding: 40,
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
    6.5,
    MARKER_DOT_RADIUS,
  ]);
  map.setPaintProperty(SAVED_LAYER, "circle-stroke-width", [
    "case",
    ["==", ["get", "id"], match],
    2.5,
    MARKER_STROKE_WIDTH,
  ]);
}

function setupSavedSpotLayers(
  map: maplibregl.Map,
  theme: "light" | "dark",
  selectedId: string | null,
) {
  const colors = labelColors(theme);
  const kindColors = savedSpotKindColorExpression(theme);

  if (map.getSource(SAVED_SOURCE)) {
    (map.getSource(SAVED_SOURCE) as GeoJSONSource).setData(savedSpotsGeoJson());
    map.setPaintProperty(SAVED_LAYER, "circle-color", kindColors);
    map.setPaintProperty(SAVED_LAYER, "circle-stroke-color", colors.stroke);
    applySavedSpotSelection(map, selectedId);
    return;
  }

  map.addSource(SAVED_SOURCE, {
    type: "geojson",
    data: savedSpotsGeoJson(),
  });

  map.addLayer({
    id: SAVED_LAYER,
    type: "circle",
    source: SAVED_SOURCE,
    paint: {
      "circle-radius": MARKER_DOT_RADIUS,
      "circle-color": kindColors,
      "circle-stroke-width": MARKER_STROKE_WIDTH,
      "circle-stroke-color": colors.stroke,
    },
  });

  applySavedSpotSelection(map, selectedId);
}

function setupStopLayers(map: maplibregl.Map, theme: "light" | "dark") {
  const colors = labelColors(theme);
  const data = stopsGeoJson();

  if (map.getSource(STOPS_SOURCE)) {
    (map.getSource(STOPS_SOURCE) as GeoJSONSource).setData(data);
    map.setPaintProperty(STOPS_LAYER, "circle-color", colors.fill);
    map.setPaintProperty(STOPS_LAYER, "circle-radius", MARKER_DOT_RADIUS);
    map.setPaintProperty(STOPS_LAYER, "circle-stroke-width", MARKER_STROKE_WIDTH);
    map.setPaintProperty(STOPS_LAYER, "circle-stroke-color", colors.stroke);
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
}

function setupHighlightLayers(map: maplibregl.Map, theme: "light" | "dark") {
  const colors = labelColors(theme);
  const data = highlightsGeoJson();

  if (map.getSource(HIGHLIGHT_SOURCE)) {
    (map.getSource(HIGHLIGHT_SOURCE) as GeoJSONSource).setData(data);
    map.setPaintProperty(HIGHLIGHT_RING_LAYER, "circle-radius", HIGHLIGHT_RING_RADIUS);
    map.setPaintProperty(HIGHLIGHT_LAYER, "circle-radius", MARKER_DOT_RADIUS);
    map.setPaintProperty(HIGHLIGHT_LAYER, "circle-stroke-width", MARKER_STROKE_WIDTH);
    map.setPaintProperty(HIGHLIGHT_LAYER, "circle-stroke-color", colors.stroke);
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
    paint: {
      "circle-radius": MARKER_DOT_RADIUS,
      "circle-color": ["get", "fill"],
      "circle-stroke-width": MARKER_STROKE_WIDTH,
      "circle-stroke-color": colors.stroke,
    },
  });

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
      "text-letter-spacing": 0.01,
    },
    paint: {
      "text-color": ["get", "fill"],
      "text-halo-color": colors.halo,
      "text-halo-width": 1.5,
    },
  });
}

export function TripMap({
  selectedSavedSpotId = null,
  onSavedSpotSelect,
  selectedStopId = null,
  onStopSelect,
}: {
  selectedSavedSpotId?: string | null;
  onSavedSpotSelect?: (id: string | null) => void;
  selectedStopId?: string | null;
  onStopSelect?: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const themeRef = useRef<"light" | "dark">("light");
  const selectedSavedSpotIdRef = useRef(selectedSavedSpotId);
  const selectedStopIdRef = useRef(selectedStopId);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const onSavedSpotSelectRef = useRef(onSavedSpotSelect);
  const onStopSelectRef = useRef(onStopSelect);

  selectedSavedSpotIdRef.current = selectedSavedSpotId;
  selectedStopIdRef.current = selectedStopId;
  onSavedSpotSelectRef.current = onSavedSpotSelect;
  onStopSelectRef.current = onStopSelect;

  const showPlacePopup = useCallback(
    (
      coordinates: [number, number],
      properties: { name: string; address: string },
    ) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({
        offset: 12,
        closeButton: true,
        className: "trip-map-popup",
      })
        .setLngLat(coordinates)
        .setHTML(popupHtml(properties))
        .addTo(map);
    },
    [],
  );

  const focusSavedSpot = useCallback(
    (spotId: string | null) => {
      const map = mapRef.current;
      if (!map || !spotId) {
        return;
      }

      const spot = savedSpots.find((entry) => entry.id === spotId);
      if (!spot) {
        return;
      }

      applySavedSpotSelection(map, spotId);
      shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    (stopId: string | null) => {
      const map = mapRef.current;
      if (!map || !stopId) {
        return;
      }

      const place = getPlaceByStopId(stopId);
      if (!place) {
        return;
      }

      shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      focusSavedSpot(selectedSavedSpotId);
    } else if (selectedStopId) {
      focusStop(selectedStopId);
    } else {
      popupRef.current?.remove();
      popupRef.current = null;
    }
  }, [selectedSavedSpotId, selectedStopId, focusSavedSpot, focusStop]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let interactionsBound = false;

    const showStopPopup = (
      coordinates: [number, number],
      properties: { name: string; address: string },
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
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") {
          return;
        }

        const properties = feature.properties as {
          id?: string;
          name: string;
          address: string;
        };

        if (event.features?.some((entry) => entry.layer?.id === SAVED_LAYER)) {
          const nextId =
            properties.id === selectedSavedSpotIdRef.current
              ? null
              : (properties.id ?? null);
          onSavedSpotSelectRef.current?.(nextId);
        } else if (
          event.features?.some(
            (entry) =>
              entry.layer?.id === STOPS_LAYER ||
              entry.layer?.id === HIGHLIGHT_LAYER ||
              entry.layer?.id === HIGHLIGHT_RING_LAYER,
          ) &&
          properties.id
        ) {
          const nextId =
            properties.id === selectedStopIdRef.current
              ? null
              : properties.id;
          onStopSelectRef.current?.(nextId);
        }

        showStopPopup(
          feature.geometry.coordinates.slice() as [number, number],
          properties,
        );
      };

      map.on("click", SAVED_LAYER, onPlaceClick);
      map.on("click", STOPS_LAYER, onPlaceClick);
      map.on("click", HIGHLIGHT_RING_LAYER, onPlaceClick);
      map.on("click", HIGHLIGHT_LAYER, onPlaceClick);
      map.on("click", HIGHLIGHT_LABELS_LAYER, onPlaceClick);

      for (const layer of [
        SAVED_LAYER,
        STOPS_LAYER,
        HIGHLIGHT_RING_LAYER,
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
      );
      setupStopLayers(map, themeRef.current);
      setupHighlightLayers(map, themeRef.current);
      bindInteractions();

      if (selectedSavedSpotIdRef.current) {
        focusSavedSpot(selectedSavedSpotIdRef.current);
      }
    };

    const init = async () => {
      await ensureInterLoaded();

      const style = await fetchMapStyle(STYLES[themeRef.current]);
      if (cancelled) {
        return;
      }

      const map = new maplibregl.Map({
        container,
        style,
        bounds: mapBounds,
        fitBoundsOptions: {
          padding: 40,
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
          );
          setupStopLayers(activeMap, nextTheme);
          setupHighlightLayers(activeMap, nextTheme);
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
      media.removeEventListener("change", onThemeChange);
      resizeObserver.disconnect();
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [focusSavedSpot, showPlacePopup]);

  return (
    <div ref={shellRef} className="trip-map-shell overflow-hidden">
      <div ref={containerRef} className="h-[min(480px,68vh)] w-full" />
    </div>
  );
}
