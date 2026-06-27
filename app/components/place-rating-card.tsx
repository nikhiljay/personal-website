"use client";

import { StarIcon } from "lucide-react";

import type { PlaceRatingsToolOutput } from "@/app/lib/kavi-trip-ai-tools";
import { citymapperDirectionsUrl } from "@/app/lib/citymapper";
import { cn } from "@/lib/utils";

function formatReviewCount(count: number) {
  if (count >= 10_000) {
    return `${Math.round(count / 1000)}k reviews`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k reviews`;
  }
  return `${count.toLocaleString()} reviews`;
}

function PlaceRatingCardSkeleton({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
    >
      <div className="flex gap-3 p-3">
        <div className="w-24 shrink-0 self-stretch min-h-24 animate-pulse rounded-lg bg-muted" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {name ? (
            <p className="truncate text-sm font-semibold">{name}</p>
          ) : (
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          )}
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

function PlaceTag({
  children,
  variant = "muted",
}: {
  children: React.ReactNode;
  variant?: "muted" | "visited";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "visited"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function PlaceRatingCardContent({
  place,
  textSize = "text-sm/relaxed",
}: {
  place: PlaceRatingsToolOutput & { found: true };
  textSize?: string;
}) {
  const hoursLabel =
    place.todayHours?.toLowerCase() === "closed" ? null : place.todayHours;

  const citymapperUrl =
    place.lat != null &&
    place.lng != null &&
    place.address
      ? citymapperDirectionsUrl({
          lat: place.lat,
          lng: place.lng,
          name: place.name,
          address: place.address,
        })
      : null;

  const hasTags = place.kind || place.visited;
  const hasStatus = place.openNow != null || hoursLabel;
  const hasRating = place.rating != null || place.userRatingCount != null;

  return (
    <div className="w-full min-w-0">
      <div className="relative flex gap-3 p-3">
        {citymapperUrl ? (
          <a
            href={citymapperUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${place.name} in Citymapper`}
            className="absolute right-3 top-3 z-10 inline-flex shrink-0 opacity-90 outline-none hover:opacity-100 focus:outline-none"
          >
            <img
              src="/images/citymapper-icon.png"
              alt=""
              width={18}
              height={18}
              className="rounded-[4px]"
            />
          </a>
        ) : null}

        <div className="relative w-24 shrink-0 self-stretch overflow-hidden rounded-lg bg-muted">
          {place.photoUrl ? (
            <img
              src={place.photoUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="flex size-full min-h-24 items-center justify-center px-1 text-center text-[10px] leading-tight text-muted-foreground">
              No photo
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center gap-1",
            citymapperUrl && "pr-7",
          )}
        >
          <p className="truncate text-sm leading-tight">
            <span className="font-semibold">{place.name}</span>
            {place.address ? (
              <>
                <span className="font-normal text-muted-foreground">
                  {" "}
                  — {place.address}
                </span>
              </>
            ) : null}
          </p>

          {hasRating ? (
            <div className="flex items-center gap-1 text-xs tabular-nums">
              {place.rating != null ? (
                <>
                  <StarIcon
                    className="size-3 shrink-0 fill-[#f5a623] text-[#f5a623]"
                    aria-hidden="true"
                  />
                  <span className="font-semibold">
                    {place.rating.toFixed(1)}
                  </span>
                </>
              ) : null}
              {place.userRatingCount != null ? (
                <span className="text-muted-foreground">
                  {place.rating != null ? "· " : ""}
                  {formatReviewCount(place.userRatingCount)}
                </span>
              ) : null}
            </div>
          ) : null}

          {hasStatus ? (
            <p className="truncate text-xs text-muted-foreground">
              {place.openNow != null ? (
                <span
                  className={cn(
                    "font-medium",
                    place.openNow
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-red-600 dark:text-red-500",
                  )}
                >
                  {place.openNow ? "Open" : "Closed"}
                </span>
              ) : null}
              {hoursLabel ? (
                <span>
                  {place.openNow != null ? " · " : ""}
                  {hoursLabel}
                </span>
              ) : null}
            </p>
          ) : null}

          {place.walkingDistanceLabel || place.walkingDurationLabel ? (
            <p className="truncate text-xs text-muted-foreground">
              {[place.walkingDistanceLabel, place.walkingDurationLabel]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}

          {hasTags ? (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {place.kind ? <PlaceTag>{place.kind}</PlaceTag> : null}
              {place.visited ? (
                <PlaceTag variant="visited">Nikhil visited</PlaceTag>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {place.note ? (
        <p
          className={cn(
            "border-t border-border bg-muted/20 px-3 py-2.5 leading-relaxed text-muted-foreground",
            textSize,
          )}
        >
          <span className="font-medium text-foreground">Nikhil:</span> {place.note}
        </p>
      ) : null}
    </div>
  );
}

type PlaceRatingCardProps = {
  state: string;
  input?: { name?: string };
  output?: PlaceRatingsToolOutput;
  textSize?: string;
  className?: string;
};

export function PlaceRatingCard({
  state,
  input,
  output,
  textSize = "text-sm/relaxed",
  className,
}: PlaceRatingCardProps) {
  const detailTextSize = "text-sm";
  if (state === "output-available" && output?.found) {
    return (
      <div
        className={cn(
          "w-full min-w-0 self-stretch overflow-hidden rounded-xl border border-border bg-background",
          className,
        )}
      >
        <PlaceRatingCardContent place={output} textSize={textSize} />
      </div>
    );
  }

  if (state === "output-available" && output && !output.found) {
    return (
      <div
        className={cn(
          "w-full min-w-0 self-stretch rounded-xl border border-border bg-muted/30 px-3 py-2 text-muted-foreground",
          detailTextSize,
          className,
        )}
      >
        Couldn&apos;t load place info{input?.name ? ` for ${input.name}` : ""}.
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div
        className={cn(
          "w-full min-w-0 self-stretch rounded-xl border border-border bg-muted/30 px-3 py-2 text-muted-foreground",
          detailTextSize,
          className,
        )}
      >
        Place lookup failed{input?.name ? ` for ${input.name}` : ""}.
      </div>
    );
  }

  return <PlaceRatingCardSkeleton name={input?.name} className={className} />;
}
