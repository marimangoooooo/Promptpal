"use client";

import { useEffect, useRef, useState } from "react";

const P5_SCRIPT_SRC = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js";
const VANTA_TOPOLOGY_SRC = "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.topology.min.js";
const SCRIPT_DATA_ATTRIBUTE = "data-topology-script";

type VantaTopologyEffect = {
  destroy: () => void;
  resize?: () => void;
};

type TopologyFactory = (options: {
  el: HTMLElement;
  p5?: unknown;
  mouseControls: boolean;
  touchControls: boolean;
  gyroControls: boolean;
  minHeight: number;
  minWidth: number;
  scale: number;
  scaleMobile: number;
  color: number;
  backgroundColor?: number;
}) => VantaTopologyEffect;

declare global {
  interface Window {
    VANTA?: {
      TOPOLOGY?: TopologyFactory;
    };
    p5?: unknown;
  }
}

const scriptCache = new Map<string, Promise<void>>();

function loadScript(src: string, key: string): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  const cachedPromise = scriptCache.get(src);

  if (cachedPromise) {
    return cachedPromise;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[${SCRIPT_DATA_ATTRIBUTE}="${key}"]`
  );

  const promise = new Promise<void>((resolve, reject) => {
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      script.dataset.loaded = "true";
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      scriptCache.delete(src);
      reject(new Error(`Failed to load ${src}`));
    };

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    if (script.dataset.loaded === "true") {
      resolve();
      return;
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      script.src = src;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.setAttribute(SCRIPT_DATA_ATTRIBUTE, key);
      document.head.appendChild(script);
    }
  });

  scriptCache.set(src, promise);
  return promise;
}

function shouldAnimateTopology(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator as Navigator & { connection?: { saveData?: boolean } };

  return !prefersReducedMotion && !connection.connection?.saveData;
}

export default function TopologyBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaTopologyEffect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      setIsAnimationEnabled(shouldAnimateTopology());
    };

    handleMotionChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMotionChange);

      return () => mediaQuery.removeEventListener("change", handleMotionChange);
    }

    mediaQuery.addListener(handleMotionChange);

    return () => mediaQuery.removeListener(handleMotionChange);
  }, []);

  useEffect(() => {
    if (!isAnimationEnabled || !containerRef.current || typeof window === "undefined") {
      return;
    }

    const container = containerRef.current;
    let isCancelled = false;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const destroyEffect = () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      effectRef.current?.destroy();
      effectRef.current = null;
      container.replaceChildren();
    };

    const initializeEffect = async () => {
      try {
        await loadScript(P5_SCRIPT_SRC, "p5");
        await loadScript(VANTA_TOPOLOGY_SRC, "vanta-topology");

        if (
          isCancelled ||
          effectRef.current ||
          !window.VANTA?.TOPOLOGY ||
          !container.isConnected
        ) {
          return;
        }

        effectRef.current = window.VANTA.TOPOLOGY({
          el: container,
          p5: window.p5,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 0.72,
          color: 0xdf2aed,
          backgroundColor: 0x222222,
        });

        if ("ResizeObserver" in window && effectRef.current?.resize) {
          resizeObserverRef.current = new ResizeObserver(() => {
            effectRef.current?.resize?.();
          });

          resizeObserverRef.current.observe(container);
        }
      } catch {
        destroyEffect();
      }
    };

    const queueInitialization = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(() => {
          void initializeEffect();
        }, { timeout: 1400 });

        return;
      }

      timeoutHandle = window.setTimeout(() => {
        void initializeEffect();
      }, 300);
    };

    queueInitialization();

    return () => {
      isCancelled = true;

      if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }

      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }

      destroyEffect();
    };
  }, [isAnimationEnabled]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden homepage-topology-shell"
    >
      <div ref={containerRef} className="absolute inset-0 homepage-topology-canvas" />
    </div>
  );
}
