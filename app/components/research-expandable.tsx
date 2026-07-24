"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { ExpandLink } from "./expand-link";
import { ExpandableAside } from "./expandable-aside";
import { ExternalLink } from "./external-link";
import "./research-lightbox.css";
import { SerifEm } from "./serif-em";
import { TasteGrid } from "./taste-grid";
import { tasteSections } from "../lib/taste";

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
  {
    src: "/images/research/book-club-llama3-minhash-v3.jpg",
    alt: "Deep learning book club annotating Llama 3 data filtering and MinHash de-duplication",
    width: 3000,
    height: 1756,
  },
] as const;

const IMAGE_COUNT = researchImages.length;
const SWIPE_THRESHOLD_PX = 40;

export function ResearchExpandable() {
  const [expanded, setExpanded] = useState(false);
  const [freeTimeExpanded, setFreeTimeExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);
  const lightboxImage = researchImages[lightboxIndex];

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function showPrev() {
    setLightboxIndex((current) => (current - 1 + IMAGE_COUNT) % IMAGE_COUNT);
  }

  function showNext() {
    setLightboxIndex((current) => (current + 1) % IMAGE_COUNT);
  }

  function onLightboxTouchStart(event: React.TouchEvent) {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    didSwipeRef.current = false;
  }

  function onLightboxTouchEnd(event: React.TouchEvent) {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) {
      return;
    }

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) {
      return;
    }

    didSwipeRef.current = true;
    if (dx < 0) {
      showNext();
    } else {
      showPrev();
    }
  }

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    // Capture phase so the dialog focus trap can't swallow arrow keys.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        setLightboxIndex(
          (current) => (current - 1 + IMAGE_COUNT) % IMAGE_COUNT,
        );
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        setLightboxIndex((current) => (current + 1) % IMAGE_COUNT);
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [lightboxOpen]);

  return (
    <>
      <p>
        <SerifEm>Chasing novel experiences</SerifEm>. Currently diving into{" "}
        <ExpandLink
          expanded={expanded}
          onOpenChange={(open) => {
            setExpanded(open);
            if (open) {
              setFreeTimeExpanded(false);
            }
          }}
        >
          research
        </ExpandLink>{" "}
        focused on post-training, RL, and long-horizon agents. In my{" "}
        <ExpandLink
          expanded={freeTimeExpanded}
          onOpenChange={(open) => {
            setFreeTimeExpanded(open);
            if (open) {
              setExpanded(false);
            }
          }}
        >
          free time
        </ExpandLink>
        , you&apos;ll find me{" "}
        <ExternalLink
          href="https://www.strava.com/athletes/nikhiljay"
          showArrow
        >
          training
        </ExternalLink>{" "}
        for a triathlon, salsa dancing, playing tennis, or at the piano.
      </p>
      <ExpandableAside open={expanded}>
        <div className="pt-4 sm:pt-3">
          <p className="text-muted">
            I&apos;m a member of YC Paper Club, collaborating with top researchers
            and founders to discuss the SOTA frontier and what it takes to get
            it into production. I also host weekly research sessions with friends
            from Columbia where we discuss leading AI papers.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2.5">
            {researchImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => openLightbox(index)}
                className="relative aspect-[2620/1775] w-full cursor-zoom-in overflow-hidden rounded-[3px] border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                aria-label={`Expand: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  quality={90}
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className={`pointer-events-none absolute inset-0 size-full object-cover select-none [-webkit-user-drag:none]${index === 2 ? " object-left" : ""}`}
                />
              </button>
            ))}
          </div>
        </div>
      </ExpandableAside>
      <ExpandableAside open={freeTimeExpanded}>
        <div className="pt-4 text-[13px] leading-5 sm:pt-3">
          <TasteGrid sections={tasteSections} />
        </div>
      </ExpandableAside>
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/45 duration-200 supports-backdrop-filter:backdrop-blur-[1px] sm:bg-black/20"
          className="fixed inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 touch-pan-y items-center justify-center overflow-visible rounded-none border-0 bg-transparent p-0 shadow-none ring-0 duration-200 sm:max-w-none data-open:zoom-in-95 data-closed:zoom-out-95"
          onClick={() => {
            if (didSwipeRef.current) {
              didSwipeRef.current = false;
              return;
            }
            setLightboxOpen(false);
          }}
          onTouchStart={onLightboxTouchStart}
          onTouchEnd={onLightboxTouchEnd}
        >
          <DialogTitle className="sr-only">{lightboxImage.alt}</DialogTitle>
          <div
            className="research-lightbox__frame"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- need explicit viewport width without next/image sizing caps */}
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              draggable={false}
              className="block h-auto w-auto max-h-[90vh] max-w-full touch-pan-y rounded-[3px] object-contain select-none [-webkit-user-drag:none] sm:max-h-[85vh]"
              onDragStart={(event) => event.preventDefault()}
            />
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
