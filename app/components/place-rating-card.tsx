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
        <div className="size-[4.5rem] shrink-0 animate-pulse rounded-lg bg-muted" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          {name ? (
            <p className="truncate text-sm font-medium">{name}</p>
          ) : (
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          )}
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function PlaceRatingCardContent({
  place,
}: {
  place: PlaceRatingsToolOutput & { found: true };
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

  return (
    <div className="w-full min-w-0">
      <div className="relative flex gap-3 p-3">
        {citymapperUrl ? (
          <a
            href={citymapperUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${place.name} in Citymapper`}
            className="absolute right-3 top-3 inline-flex shrink-0 opacity-90 outline-none hover:opacity-100 focus:outline-none"
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

        <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted">
          {place.photoUrl ? (
            <img
              src={place.photoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center px-1 text-center text-[10px] leading-tight text-muted-foreground">
              No photo
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-2",
            citymapperUrl && "pr-7",
          )}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">
              {place.name}
            </p>
            {place.address ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {place.address}
              </p>
            ) : null}
          </div>

          {(place.kind || place.visited) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {place.kind ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                  {place.kind}
                </span>
              ) : null}
              {place.visited ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                  Nikhil visited
                </span>
              ) : null}
            </div>
          )}

          {place.openNow != null || hoursLabel ? (
            <p className="text-xs">
              {place.openNow != null ? (
                <span
                  className={cn(
                    "font-medium",
                    place.openNow
                      ? "text-green-600 dark:text-green-500"
                      : "text-red-600 dark:text-red-500",
                  )}
                >
                  {place.openNow ? "Open" : "Closed"}
                </span>
              ) : null}
              {hoursLabel ? (
                <span className="text-muted-foreground">
                  {place.openNow != null ? " · " : ""}
                  {hoursLabel}
                </span>
              ) : null}
            </p>
          ) : null}

          {place.rating != null || place.userRatingCount != null ? (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              {place.rating != null ? (
                <>
                  <StarIcon
                    className="size-3.5 shrink-0 fill-[#f5a623] text-[#f5a623]"
                    aria-hidden="true"
                  />
                  <span className="font-medium tabular-nums">
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
        </div>
      </div>

      {place.note ? (
        <p className="border-t border-border px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
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
  className?: string;
};

export function PlaceRatingCard({
  state,
  input,
  output,
  className,
}: PlaceRatingCardProps) {
  if (state === "output-available" && output?.found) {
    return (
      <div
        className={cn(
          "w-full min-w-0 self-stretch overflow-hidden rounded-xl border border-border bg-background",
          className,
        )}
      >
        <PlaceRatingCardContent place={output} />
      </div>
    );
  }

  if (state === "output-available" && output && !output.found) {
    return (
      <div
        className={cn(
          "w-full min-w-0 self-stretch rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
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
          "w-full min-w-0 self-stretch rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
          className,
        )}
      >
        Place lookup failed{input?.name ? ` for ${input.name}` : ""}.
      </div>
    );
  }

  return <PlaceRatingCardSkeleton name={input?.name} className={className} />;
}
