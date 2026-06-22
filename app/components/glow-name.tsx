"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import "./glow-name.css";

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const IGNORED = new Set([" ", "'"]);

type ScrambleMode = "idle" | "hover" | "reset";

function randomScrambleChar() {
  const index = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
  return SCRAMBLE_CHARS.charAt(index);
}

function scrambleText(text: string) {
  return [...text]
    .map((char) => (IGNORED.has(char) ? char : randomScrambleChar()))
    .join("");
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export function GlowName({ text = "Nikhil D'Souza" }: { text?: string }) {
  const [display, setDisplay] = useState(text);
  const modeRef = useRef<ScrambleMode>("idle");
  const frameRef = useRef(0);
  const revealIndexRef = useRef(0);
  const lastTickRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  const stopAnimation = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  const runHoverScramble = useCallback(
    (timestamp: number) => {
      if (modeRef.current !== "hover") {
        return;
      }

      if (timestamp - lastTickRef.current >= 40) {
        lastTickRef.current = timestamp;
        setDisplay(scrambleText(text));
      }

      frameRef.current = requestAnimationFrame(runHoverScramble);
    },
    [text],
  );

  const runReset = useCallback(() => {
    if (modeRef.current !== "reset") {
      return;
    }

    revealIndexRef.current += 3;

    if (revealIndexRef.current >= text.length) {
      setDisplay(text);
      modeRef.current = "idle";
      stopAnimation();
      return;
    }

    const locked = text.slice(0, revealIndexRef.current);
    const tail = scrambleText(text.slice(revealIndexRef.current));
    setDisplay(locked + tail);
    frameRef.current = requestAnimationFrame(runReset);
  }, [stopAnimation, text]);

  const handleMouseEnter = () => {
    if (prefersReducedMotion) {
      return;
    }

    stopAnimation();
    modeRef.current = "hover";
    lastTickRef.current = 0;
    setDisplay(scrambleText(text));
    frameRef.current = requestAnimationFrame(runHoverScramble);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) {
      setDisplay(text);
      return;
    }

    stopAnimation();
    modeRef.current = "reset";
    revealIndexRef.current = 0;
    frameRef.current = requestAnimationFrame(runReset);
  };

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => stopAnimation, [stopAnimation]);

  return (
    <h1
      className="glow-name shrink-0 cursor-default whitespace-nowrap font-display text-base font-medium"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={text}
    >
      {display}
    </h1>
  );
}
