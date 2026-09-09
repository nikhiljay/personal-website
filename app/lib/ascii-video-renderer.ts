const DENSITY =
  "#W@8Q&$MHB%DK*+=xahkpqwmzO0XYUCL/\\|()[]{}?~<>!;:^\"',. ";

const CELL_ASPECT = 0.6;
const TILE_OPACITY = 0.5;
const GAMMA = 1.6;
const CHAR_FILL = 0.8;
const DPR_CAP = 2;
const MIN_COLS = 10;
const MIN_ROWS = 5;

export type AsciiVideoRenderer = {
  setVisible: (visible: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

type CreateAsciiVideoRendererOptions = {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  fontFamily: string;
  cellSizePx?: number;
};

function cellSizeForWidth(width: number, override?: number) {
  if (override) {
    return override;
  }
  if (width < 400) {
    return 6;
  }
  return 8;
}

export function createAsciiVideoRenderer({
  canvas,
  video,
  fontFamily,
  cellSizePx,
}: CreateAsciiVideoRendererOptions): AsciiVideoRenderer {
  const ctx = canvas.getContext("2d", { alpha: false });
  const sample = document.createElement("canvas");
  const sampleCtx = sample.getContext("2d", { willReadFrequently: true });

  if (!ctx || !sampleCtx) {
    return {
      setVisible() {},
      setReducedMotion() {},
      resize() {},
      dispose() {},
    };
  }

  let disposed = false;
  let visible = true;
  let reducedMotion = false;
  let raf = 0;
  let cols = 0;
  let rows = 0;
  let cssW = 0;
  let cssH = 0;
  let lastTime = -1;
  let hasDrawn = false;

  const drawFrame = (force = false) => {
    if (disposed || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    if (!force && video.currentTime === lastTime && hasDrawn) {
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh || cols < 1 || rows < 1) {
      return;
    }

    lastTime = video.currentTime;
    sample.width = cols;
    sample.height = rows;
    sampleCtx.imageSmoothingEnabled = true;

    const srcAspect = vw / vh;
    const dstAspect = cssW / cssH;
    let dx = 0;
    let dy = 0;
    let dw = cols;
    let dh = rows;
    if (srcAspect > dstAspect) {
      dw = cols * (srcAspect / dstAspect);
      dx = (cols - dw) / 2;
    } else if (srcAspect < dstAspect) {
      dh = rows * (dstAspect / srcAspect);
      dy = (rows - dh) / 2;
    }
    sampleCtx.drawImage(video, dx, dy, dw, dh);

    const pixels = sampleCtx.getImageData(0, 0, cols, rows).data;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const width = cssW;
    const height = cssH;
    const cellW = width / cols;
    const cellH = height / rows;
    const fontSize = Math.max(5, Math.floor(cellH * CHAR_FILL));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.font = `300 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lastIndex = DENSITY.length - 1;

    for (let y = 0; y < rows; y += 1) {
      const y0 = Math.floor(y * cellH);
      const y1 = Math.floor((y + 1) * cellH);
      const cy = (y0 + y1) / 2;

      for (let x = 0; x < cols; x += 1) {
        const i = (y * cols + x) * 4;
        const r = pixels[i] ?? 0;
        const g = pixels[i + 1] ?? 0;
        const b = pixels[i + 2] ?? 0;
        const lum = Math.pow((0.299 * r + 0.587 * g + 0.114 * b) / 255, GAMMA);
        const idx = Math.min(lastIndex, Math.round(lum * lastIndex));
        const ch = DENSITY[lastIndex - idx] ?? " ";

        const x0 = Math.floor(x * cellW);
        const x1 = Math.floor((x + 1) * cellW);

        ctx.fillStyle = `rgb(${(r * TILE_OPACITY) | 0},${(g * TILE_OPACITY) | 0},${(b * TILE_OPACITY) | 0})`;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.fillText(ch, (x0 + x1) / 2, cy);
      }
    }

    hasDrawn = true;
  };

  const tick = () => {
    if (disposed || !visible) {
      return;
    }
    drawFrame();
    if (!reducedMotion) {
      raf = window.requestAnimationFrame(tick);
    }
  };

  const stopLoop = () => {
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const syncPlayback = () => {
    if (disposed) {
      return;
    }
    if (!visible) {
      stopLoop();
      video.pause();
      return;
    }
    if (reducedMotion) {
      stopLoop();
      video.pause();
      drawFrame(true);
      return;
    }
    const play = video.play();
    if (play) {
      void play.catch(() => {});
    }
    if (!raf) {
      raf = window.requestAnimationFrame(tick);
    }
  };

  const resize = () => {
    if (disposed) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const nextW = Math.max(2, Math.floor(cssW * dpr));
    const nextH = Math.max(2, Math.floor(cssH * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }

    const target = cellSizeForWidth(cssW, cellSizePx);
    cols = Math.max(MIN_COLS, Math.floor(cssW / target));
    const cellW = cssW / cols;
    const cellH = cellW / CELL_ASPECT;
    rows = Math.max(MIN_ROWS, Math.floor(cssH / cellH));
    hasDrawn = false;
    drawFrame(true);
  };

  const onLoaded = () => {
    resize();
    syncPlayback();
  };

  video.addEventListener("loadeddata", onLoaded);
  video.addEventListener("seeked", onLoaded);

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    onLoaded();
  }

  return {
    setVisible(next) {
      visible = next;
      syncPlayback();
    },
    setReducedMotion(next) {
      reducedMotion = next;
      syncPlayback();
    },
    resize,
    dispose() {
      disposed = true;
      stopLoop();
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onLoaded);
    },
  };
}
