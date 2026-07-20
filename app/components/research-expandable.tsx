"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ExpandableAside } from "./expandable-aside";
import { ExternalLink } from "./external-link";
import "./research-lightbox.css";
import { SerifEm } from "./serif-em";

const researchImages = [
  {
    src: "/images/research/book-club-grpo-cropped.jpg",
    alt: "Deep learning book club discussing PPO, GRPO, and trust region methods",
    width: 2354,
    height: 1748,
  },
  {
    src: "/images/research/book-club-rlvr-cropped.jpg",
    alt: "Deep learning book club reviewing RLVR Pass@K results on math benchmarks",
    width: 2620,
    height: 1775,
  },
  {
    src: "/images/research/book-club-search-rl-cropped.jpg",
    alt: "Deep learning book club reading a Search-RL paper on multi-turn agents",
    width: 5092,
    height: 2708,
  },
] as const;

const LIGHTBOX_CLOSE_MS = 220;
const IMAGE_COUNT = researchImages.length;

export function ResearchExpandable() {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const titleId = useId();
  const lightboxActive = lightboxIndex != null;
  const lightboxImage =
    lightboxIndex != null ? researchImages[lightboxIndex] : null;

  function clearCloseTimeout() {
    if (closeTimeoutRef.current != null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function closeLightbox() {
    setLightboxOpen(false);
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setLightboxIndex(null);
      closeTimeoutRef.current = null;
    }, LIGHTBOX_CLOSE_MS);
  }

  function openLightbox(index: number) {
    clearCloseTimeout();
    setLightboxIndex(index);
  }

  function showPrev() {
    setLightboxIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current - 1 + IMAGE_COUNT) % IMAGE_COUNT;
    });
  }

  function showNext() {
    setLightboxIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current + 1) % IMAGE_COUNT;
    });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lightboxActive) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setLightboxOpen(true);
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxActive]);

  useEffect(() => {
    if (!lightboxActive) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        clearCloseTimeout();
        closeTimeoutRef.current = window.setTimeout(() => {
          setLightboxIndex(null);
          closeTimeoutRef.current = null;
        }, LIGHTBOX_CLOSE_MS);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLightboxIndex((current) =>
          current == null ? current : (current - 1 + IMAGE_COUNT) % IMAGE_COUNT,
        );
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setLightboxIndex((current) =>
          current == null ? current : (current + 1) % IMAGE_COUNT,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxActive]);

  return (
    <>
      <p>
        <SerifEm>Chasing novel experiences</SerifEm>. Currently diving into{" "}
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="site-link inline cursor-pointer border-0 bg-transparent p-0 font-inherit"
        >
          research
        </button>{" "}
        with a focus on post-training, RL, and long-horizon agents. In my free
        time, you&apos;ll find me{" "}
        <ExternalLink href="https://www.strava.com/athletes/nikhiljay">
          training
        </ExternalLink>{" "}
        for a triathlon, salsa dancing, playing tennis, or at the piano.
      </p>
      <ExpandableAside open={expanded}>
        <div className="grid grid-cols-2 gap-2 pt-4">
          {researchImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => openLightbox(index)}
              className="cursor-zoom-in border-0 bg-transparent p-0"
              aria-label={`Expand: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
                className="h-auto w-full rounded-[3px] select-none [-webkit-user-drag:none]"
              />
            </button>
          ))}
        </div>
      </ExpandableAside>
      {mounted && lightboxImage && lightboxIndex != null
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`research-lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/70${lightboxOpen ? " is-open" : ""}`}
              onClick={closeLightbox}
            >
              <h2 id={titleId} className="sr-only">
                {lightboxImage.alt}
              </h2>
              <button
                type="button"
                className="research-lightbox__nav research-lightbox__nav--prev"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
              >
                <ChevronLeft className="size-5" strokeWidth={1.75} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element -- need explicit viewport width without next/image sizing caps */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                draggable={false}
                className="research-lightbox__image rounded-[3px] select-none [-webkit-user-drag:none]"
                style={{ width: "80vw", height: "auto" }}
                onClick={(event) => event.stopPropagation()}
                onDragStart={(event) => event.preventDefault()}
              />
              <button
                type="button"
                className="research-lightbox__nav research-lightbox__nav--next"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                <ChevronRight className="size-5" strokeWidth={1.75} />
              </button>
              <p className="research-lightbox__count" aria-hidden>
                {lightboxIndex + 1} / {IMAGE_COUNT}
              </p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
