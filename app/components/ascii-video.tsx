"use client";

import { Geist_Mono } from "next/font/google";
import { useEffect, useRef, useState } from "react";

import { createAsciiVideoRenderer } from "@/app/lib/ascii-video-renderer";
import { cn } from "@/lib/utils";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: "300",
});

const CLIPS = [
  { id: "a" },
  { id: "b", playbackRate: 1.2 },
] as const;

type AsciiVideoProps = {
  label: string;
  className?: string;
};

function createDetachedVideo() {
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  return video;
}

async function objectUrlFor(id: string) {
  const response = await fetch(`/api/m/${id}`, {
    headers: { Accept: "application/octet-stream" },
  });
  if (!response.ok) {
    throw new Error("clip unavailable");
  }
  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], { type: "video/mp4" });
  return URL.createObjectURL(blob);
}

export function AsciiVideo({ label, className }: AsciiVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspectRatio, setAspectRatio] = useState("16 / 9");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const video = createDetachedVideo();
    const urls: string[] = [];
    const cache = new Map<string, string>();
    let index = 0;
    let disposed = false;

    const renderer = createAsciiVideoRenderer({
      canvas,
      video,
      fontFamily: geistMono.style.fontFamily,
    });

    const remember = (url: string) => {
      urls.push(url);
      return url;
    };

    const loadUrl = async (id: string) => {
      const hit = cache.get(id);
      if (hit) {
        return hit;
      }
      const url = remember(await objectUrlFor(id));
      cache.set(id, url);
      return url;
    };

    const applyRate = () => {
      video.playbackRate = CLIPS[index]?.playbackRate ?? 1;
    };

    const applyAspect = () => {
      applyRate();
      if (index !== 0) {
        return;
      }
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
      }
    };

    const loadClip = async (nextIndex: number) => {
      const clip = CLIPS[nextIndex] ?? CLIPS[0];
      if (!clip) {
        return;
      }
      index = nextIndex;
      const url = await loadUrl(clip.id);
      if (disposed) {
        return;
      }
      video.src = url;
      applyRate();
      const upcoming = CLIPS[(nextIndex + 1) % CLIPS.length];
      if (upcoming && upcoming.id !== clip.id) {
        void loadUrl(upcoming.id);
      }
    };

    const onEnded = () => {
      if (CLIPS.length < 2 || disposed) {
        return;
      }
      void loadClip((index + 1) % CLIPS.length).then(() => {
        if (!disposed) {
          void video.play().catch(() => {});
        }
      });
    };

    video.loop = CLIPS.length < 2;
    video.addEventListener("loadedmetadata", applyAspect);
    video.addEventListener("ended", onEnded);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => renderer.setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);

    const io = new IntersectionObserver(
      ([entry]) => {
        renderer.setVisible(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );
    renderer.setVisible(true);
    io.observe(container);

    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(container);

    void document.fonts.ready.then(() => {
      renderer.resize();
    });

    void loadClip(0);

    return () => {
      disposed = true;
      renderer.dispose();
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("loadedmetadata", applyAspect);
      video.removeEventListener("ended", onEnded);
      motion.removeEventListener("change", onMotion);
      io.disconnect();
      ro.disconnect();
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return (
    <figure
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-black",
        geistMono.className,
        className,
      )}
      style={{ aspectRatio }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-pan-y"
        role="img"
        aria-label={label}
      />
    </figure>
  );
}
