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
  { id: "a", playbackRate: 1 },
  { id: "b", playbackRate: 1.2 },
] as const;

const FIRST_ASPECT = "480 / 268";

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
  video.loop = false;
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

function waitForData(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const onData = () => {
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("loadeddata", onData);
      reject(new Error("clip failed"));
    };
    video.addEventListener("loadeddata", onData, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

export function AsciiVideo({ label, className }: AsciiVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(FIRST_ASPECT);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const players = [createDetachedVideo(), createDetachedVideo()];
    const urls: string[] = [];
    const cache = new Map<string, string>();
    let index = 0;
    let active = 0;
    let disposed = false;

    const renderer = createAsciiVideoRenderer({
      canvas,
      video: players[0],
      fontFamily: geistMono.style.fontFamily,
      onFirstFrame() {
        if (!disposed) {
          setReady(true);
        }
      },
    });

    const loadUrl = async (id: string) => {
      const hit = cache.get(id);
      if (hit) {
        return hit;
      }
      const url = await objectUrlFor(id);
      urls.push(url);
      cache.set(id, url);
      return url;
    };

    const attach = async (player: HTMLVideoElement, clipIndex: number) => {
      const clip = CLIPS[clipIndex] ?? CLIPS[0];
      if (!clip) {
        return;
      }
      const url = await loadUrl(clip.id);
      if (disposed) {
        return;
      }
      if (player.src !== url) {
        player.src = url;
      }
      player.playbackRate = clip.playbackRate ?? 1;
      player.currentTime = 0;
      await waitForData(player);
    };

    const applyAspect = (player: HTMLVideoElement) => {
      if (player.videoWidth > 0 && player.videoHeight > 0) {
        setAspectRatio(`${player.videoWidth} / ${player.videoHeight}`);
      }
    };

    const onEnded = () => {
      if (CLIPS.length < 2 || disposed) {
        return;
      }
      const nextIndex = (index + 1) % CLIPS.length;
      const idle = 1 - active;
      const next = players[idle];
      if (next.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        void attach(next, nextIndex).then(() => {
          if (!disposed) {
            onEnded();
          }
        });
        return;
      }
      index = nextIndex;
      active = idle;
      renderer.setVideo(next);
      void next.play().catch(() => {});
      const following = (nextIndex + 1) % CLIPS.length;
      void attach(players[1 - active], following);
    };

    for (const player of players) {
      player.addEventListener("ended", onEnded);
    }

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

    void attach(players[0], 0)
      .then(() => {
        if (disposed) {
          return;
        }
        applyAspect(players[0]);
        renderer.setVideo(players[0]);
        void attach(players[1], 1);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      renderer.dispose();
      for (const player of players) {
        player.pause();
        player.removeAttribute("src");
        player.load();
        player.removeEventListener("ended", onEnded);
      }
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
        "relative w-full overflow-hidden transition-opacity duration-500 motion-reduce:transition-none",
        ready ? "opacity-100" : "opacity-0",
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
