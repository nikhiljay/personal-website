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
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  return video;
}

async function objectUrlFor(id: string) {
  const response = await fetch(`/api/m/${id}`, {
    cache: "no-store",
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
    const finish = (fn: () => void) => {
      window.clearTimeout(timer);
      video.removeEventListener("loadeddata", onData);
      video.removeEventListener("error", onError);
      fn();
    };
    const onData = () => finish(resolve);
    const onError = () => finish(() => reject(new Error("clip failed")));
    const timer = window.setTimeout(
      () => finish(() => reject(new Error("clip timeout"))),
      15000,
    );
    video.addEventListener("loadeddata", onData);
    video.addEventListener("error", onError);
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

    const player = createDetachedVideo();
    const urls: string[] = [];
    const cache = new Map<string, string>();
    let index = 0;
    let pendingIndex: number | null = null;
    let disposed = false;
    let advancing = false;

    const renderer = createAsciiVideoRenderer({
      canvas,
      video: player,
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

    const applyAspect = () => {
      if (player.videoWidth > 0 && player.videoHeight > 0) {
        setAspectRatio(`${player.videoWidth} / ${player.videoHeight}`);
      }
    };

    const attach = async (clipIndex: number) => {
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
        player.load();
      }
      player.playbackRate = clip.playbackRate ?? 1;
      await waitForData(player);
      if (player.currentTime > 0) {
        player.currentTime = 0;
      }
    };

    const clipFinished = () => {
      if (player.ended) {
        return true;
      }
      const duration = player.duration;
      return (
        Number.isFinite(duration) &&
        duration > 0 &&
        player.currentTime >= duration - 0.05
      );
    };

    const advance = () => {
      if (disposed || advancing || CLIPS.length < 2) {
        return;
      }
      if (pendingIndex == null) {
        if (!clipFinished()) {
          return;
        }
        pendingIndex = (index + 1) % CLIPS.length;
      }
      const nextIndex = pendingIndex;
      const clip = CLIPS[nextIndex];
      if (!clip) {
        pendingIndex = null;
        return;
      }
      const url = cache.get(clip.id);
      if (!url) {
        advancing = true;
        void loadUrl(clip.id)
          .then(() => {
            advancing = false;
            if (!disposed) {
              advance();
            }
          })
          .catch(() => {
            advancing = false;
          });
        return;
      }

      advancing = true;
      if (player.src !== url) {
        player.src = url;
        player.load();
      } else if (player.currentTime > 0) {
        player.currentTime = 0;
      }
      player.playbackRate = clip.playbackRate ?? 1;
      renderer.setVideo(player);
      void player
        .play()
        .then(() => {
          if (disposed) {
            return;
          }
          index = nextIndex;
          pendingIndex = null;
          applyAspect();
          renderer.setVideo(player);
        })
        .catch(async () => {
          try {
            await waitForData(player);
            if (disposed) {
              return;
            }
            await player.play();
            if (disposed) {
              return;
            }
            index = nextIndex;
            pendingIndex = null;
            applyAspect();
            renderer.setVideo(player);
          } catch {
            // poll retries the same pending clip
          }
        })
        .finally(() => {
          advancing = false;
        });
    };

    player.addEventListener("ended", advance);
    player.addEventListener("loadeddata", applyAspect);

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

    void Promise.all(CLIPS.map((clip) => loadUrl(clip.id))).catch(() => {});

    void attach(0)
      .then(() => {
        if (disposed) {
          return;
        }
        applyAspect();
        renderer.setVideo(player);
        setReady(true);
      })
      .catch(() => {});

    const poll = window.setInterval(() => {
      if (!disposed) {
        advance();
      }
    }, 250);

    return () => {
      disposed = true;
      window.clearInterval(poll);
      renderer.dispose();
      player.pause();
      player.removeAttribute("src");
      player.load();
      player.removeEventListener("ended", advance);
      player.removeEventListener("loadeddata", applyAspect);
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
