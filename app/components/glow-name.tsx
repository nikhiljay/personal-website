"use client";

import { useEffect, useRef, useState } from "react";

const FLICKER_MS = 1000;
const FADE_OUT_MS = 350;

export function GlowName({ children }: { children: React.ReactNode }) {
  const [isLit, setIsLit] = useState(true);
  const [isFlickering, setIsFlickering] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const flickeringRef = useRef(false);
  const fadingOutRef = useRef(false);
  const flickerTimeoutRef = useRef<number | null>(null);
  const fadeOutTimeoutRef = useRef<number | null>(null);

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
      if (fadeOutTimeoutRef.current) {
        window.clearTimeout(fadeOutTimeoutRef.current);
      }
    };
  }, []);

  const clearFlicker = () => {
    flickeringRef.current = false;
    if (flickerTimeoutRef.current) {
      window.clearTimeout(flickerTimeoutRef.current);
      flickerTimeoutRef.current = null;
    }
    setIsFlickering(false);
  };

  const finishFlicker = () => {
    if (!flickeringRef.current) {
      return;
    }

    clearFlicker();
    setIsLit(true);
  };

  const finishFadeOut = () => {
    if (!fadingOutRef.current) {
      return;
    }

    fadingOutRef.current = false;
    if (fadeOutTimeoutRef.current) {
      window.clearTimeout(fadeOutTimeoutRef.current);
      fadeOutTimeoutRef.current = null;
    }
    setIsFadingOut(false);
    setIsLit(false);
  };

  const startFadeOut = () => {
    if (prefersReducedMotion) {
      setIsLit(false);
      return;
    }

    fadingOutRef.current = true;
    setIsFadingOut(true);
    fadeOutTimeoutRef.current = window.setTimeout(finishFadeOut, FADE_OUT_MS);
  };

  const handleClick = () => {
    if (isFadingOut) {
      return;
    }

    if (isLit || isFlickering) {
      clearFlicker();
      startFadeOut();
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

    if (event.animationName === "name-lamp-flicker-in") {
      finishFlicker();
    }

    if (event.animationName === "name-lamp-fade-out") {
      finishFadeOut();
    }
  };

  const className = [
    "name-lamp",
    isLit && !isFadingOut ? "name-lamp--on" : "",
    isFlickering ? "name-lamp--flicker" : "",
    isFadingOut ? "name-lamp--fade-out" : "",
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
        aria-pressed={isLit && !isFadingOut}
        aria-label={
          isLit && !isFadingOut ? "Turn off the light" : "Turn on the light"
        }
      >
        {children}
      </button>
    </h1>
  );
}
