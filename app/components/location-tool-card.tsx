"use client";

import type { CurrentLocationToolOutput } from "@/app/lib/user-location";
import { CurrentLocationDot } from "@/app/components/current-location-dot";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LocationToolCardProps = {
  state: string;
  output?: CurrentLocationToolOutput;
  textSize?: string;
  className?: string;
};

export function LocationToolCard({
  state,
  output,
  textSize = "text-sm/relaxed",
  className,
}: LocationToolCardProps) {
  if (state === "output-available" && output) {
    return (
      <Marker
        className={cn(textSize, "leading-none", className)}
        role="status"
      >
        <MarkerIcon className="size-4">
          <CurrentLocationDot active={output.mode === "in_nyc"} />
        </MarkerIcon>
        <MarkerContent className="leading-none">{output.label}</MarkerContent>
      </Marker>
    );
  }

  return (
    <Marker
      className={cn(textSize, "leading-none", className)}
      role="status"
      aria-busy="true"
    >
      <MarkerIcon>
        <Spinner className="size-3.5" />
      </MarkerIcon>
      <MarkerContent className="leading-none">Checking location…</MarkerContent>
    </Marker>
  );
}
