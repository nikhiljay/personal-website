import { tool } from "ai";
import { z } from "zod";

import { getPlaceCardDataForSpot } from "./google-places";

export type PlaceRatingsToolOutput =
  | { found: false; error: string }
  | {
      found: true;
      name: string;
      address: string | null;
      rating: number | null;
      userRatingCount: number | null;
      googleMapsUri: string | null;
      photoUrl: string | null;
      kind: string | null;
      note: string | null;
      visited: boolean;
      spotId: string | null;
      openNow: boolean | null;
      todayHours: string | null;
      lat: number | null;
      lng: number | null;
    };

export const kaviTripAiTools = {
  getPlaceRatings: tool({
    description:
      "Look up a place and return card data (photo, Google rating, review count, kind). Call whenever you mention, recommend, or discuss a specific restaurant or spot so a rich place card can be shown.",
    inputSchema: z.object({
      name: z.string().describe("Place name, using exact names from trip data"),
      address: z
        .string()
        .optional()
        .describe("Street address to disambiguate similar names"),
      spotId: z
        .string()
        .optional()
        .describe("Saved spot id from trip data, when known"),
    }),
    execute: async ({ name, address, spotId }): Promise<PlaceRatingsToolOutput> => {
      const result = await getPlaceCardDataForSpot({ name, address, spotId });

      if ("error" in result) {
        return { found: false, error: result.error };
      }

      return {
        found: true,
        name: result.name,
        address: result.address,
        rating: result.rating,
        userRatingCount: result.userRatingCount,
        googleMapsUri: result.googleMapsUri,
        photoUrl: result.photoUrl,
        kind: result.kind,
        note: result.note,
        visited: result.visited,
        spotId: result.spotId,
        openNow: result.openNow,
        todayHours: result.todayHours,
        lat: result.lat,
        lng: result.lng,
      };
    },
  }),
};
