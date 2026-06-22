"use client";

import { useEffect, useState } from "react";

type VisitorResponse = {
  lastVisitorLabel: string | null;
};

const timeZone = "America/Los_Angeles";

function getClockHands(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const hours = get("hour") % 12;
  const minutes = get("minute");
  const seconds = get("second");

  return {
    hourRotation: hours * 30 + minutes * 0.5 + seconds * (0.5 / 60),
    minuteRotation: minutes * 6 + seconds * 0.1,
  };
}

function formatDigitalTime(date: Date) {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);

  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  return `${time} ${timeZoneName ?? "PT"}`;
}

function AnalogClock({ date }: { date: Date }) {
  const { hourRotation, minuteRotation } = getClockHands(date);

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="5" strokeWidth="1" />
      <line
        x1="6"
        y1="6"
        x2="6"
        y2="3.5"
        strokeWidth="1.2"
        strokeLinecap="round"
        transform={`rotate(${hourRotation} 6 6)`}
      />
      <line
        x1="6"
        y1="6"
        x2="6"
        y2="2.2"
        strokeWidth="1"
        strokeLinecap="round"
        transform={`rotate(${minuteRotation} 6 6)`}
      />
    </svg>
  );
}

export function SiteStatusBar() {
  const [now, setNow] = useState<Date | null>(null);
  const [lastVisitor, setLastVisitor] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/visitor")
      .then((response) => response.json())
      .then((data: VisitorResponse) => {
        setLastVisitor(data.lastVisitorLabel);
      })
      .catch(() => {});
  }, []);

  if (!now) {
    return <div className="h-4 w-24" aria-hidden="true" />;
  }

  return (
    <div className="flex h-4 items-center justify-end gap-2 text-right font-mono text-xs text-muted">
      <span className="flex items-center gap-1.5">
        <AnalogClock date={now} />
        {formatDigitalTime(now)}
      </span>
      {lastVisitor ? (
        <span className="hidden sm:inline">• Last visitor from {lastVisitor}</span>
      ) : null}
    </div>
  );
}
