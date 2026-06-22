"use client";

import { useEffect, useRef, useState } from "react";

const FLICKER_MS = 1000;

export function GlowName({ children }: { children: React.ReactNode }) {
  const [isLit, setIsLit] = useState(true);
  const [isFlickering, setIsFlickering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const flickeringRef = useRef(false);
  const flickerTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (flickerTimeoutRef.current) {
        window.clearTimeout(flickerTimeoutRef.current);
      }
    };
  }, []);

  const finishFlicker = () => {
    if (!flickeringRef.current) {
      return;
    }

    flickeringRef.current = false;
    if (flickerTimeoutRef.current) {
      window.clearTimeout(flickerTimeoutRef.current);
      flickerTimeoutRef.current = null;
    }
    setIsFlickering(false);
    setIsLit(true);
  };

  const handleClick = () => {
    if (isLit || isFlickering) {
      flickeringRef.current = false;
      if (flickerTimeoutRef.current) {
        window.clearTimeout(flickerTimeoutRef.current);
        flickerTimeoutRef.current = null;
      }
      setIsLit(false);
      setIsFlickering(false);
      return;
    }

    if (prefersReducedMotion) {
      setIsLit(true);
      return;
    }

    flickeringRef.current = true;
    setIsFlickering(true);
    flickerTimeoutRef.current = window.setTimeout(finishFlicker, FLICKER_MS);
  };

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLButtonElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    finishFlicker();
  };

  const className = [
    "name-lamp",
    isLit ? "name-lamp--on" : "",
    isFlickering ? "name-lamp--flicker" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <h1 className="shrink-0 whitespace-nowrap font-display text-base font-medium">
      <button
        type="button"
        className={className}
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
        aria-pressed={isLit}
        aria-label={isLit ? "Turn off the light" : "Turn on the light"}
      >
        {children}
      </button>
    </h1>
  );
}
