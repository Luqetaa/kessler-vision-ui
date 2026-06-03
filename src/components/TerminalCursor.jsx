import { useEffect, useRef, useState } from "react";
import "./TerminalCursor.css";

/* Threshold: elements WIDER than this get [CLICK] label; smaller ones get wrapping brackets */
const LARGE_BUTTON_MIN_WIDTH = 200;

// Global tracker to persist mouse coordinates across component unmounts/remounts (uninterrupted cursor transitions)
let globalMouseX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
let globalMouseY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });
}

export default function TerminalCursor({ enabled = true }) {
  const cursorRef = useRef(null);
  const mouse = useRef({ x: globalMouseX, y: globalMouseY });
  const pos = useRef({ x: globalMouseX, y: globalMouseY });
  const lockedEl = useRef(null);
  const [targetRect, setTargetRect] = useState(null);
  const [isSmall, setIsSmall] = useState(false);
  const [onResize, setOnResize] = useState(false);

  /* Mouse tracking — detects element */
  useEffect(() => {
    if (!enabled) return;

    // Adiciona classe ao body para esconder o cursor padrão
    document.body.classList.add("cursor-hidden");

    const move = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Hide custom cursor when over resize handles
      const resizeEl = e.target instanceof Element ? e.target.closest("[data-resize]") : null;
      setOnResize(!!resizeEl);
      if (resizeEl) {
        lockedEl.current = null;
        setTargetRect(null);
        setIsSmall(false);
        return;
      }

      const target =
        e.target instanceof Element
          ? e.target.closest("button, a, [data-cursor], input, select, textarea")
          : null;
      if (target) {
        lockedEl.current = target;
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        setIsSmall(rect.width < LARGE_BUTTON_MIN_WIDTH);
      } else {
        lockedEl.current = null;
        setTargetRect(null);
        setIsSmall(false);
      }
    };

    const leave = () => {
      lockedEl.current = null;
      setTargetRect(null);
      setIsSmall(false);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
      document.body.classList.remove("cursor-hidden");
    };
  }, [enabled]);

  /* Snappier follow — higher lerp + instant snap when close */
  useEffect(() => {
    if (!enabled) return;
    let frame;
    const animate = () => {
      const liveRect = lockedEl.current
        ? lockedEl.current.getBoundingClientRect()
        : null;

      // Small buttons: snap to center. Large buttons & idle: follow mouse.
      const isSmallEl = liveRect && liveRect.width < LARGE_BUTTON_MIN_WIDTH;

      const targetX = isSmallEl
        ? liveRect.left + liveRect.width / 2
        : mouse.current.x;
      const targetY = isSmallEl
        ? liveRect.top + liveRect.height / 2 - 2
        : mouse.current.y;

      const dx = targetX - pos.current.x;
      const dy = targetY - pos.current.y;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        pos.current.x = targetX;
        pos.current.y = targetY;
      } else {
        pos.current.x += dx * 0.45;
        pos.current.y += dy * 0.45;
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${pos.current.x}px`;
        cursorRef.current.style.top = `${pos.current.y}px`;
        if (liveRect) {
          setTargetRect((prev) => {
            if (
              !prev ||
              Math.abs(prev.width - liveRect.width) > 1 ||
              Math.abs(prev.height - liveRect.height) > 1
            )
              return liveRect;
            return prev;
          });
        }
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  if (!enabled || onResize) return null;

  /* ── Large button mode: fixed [CLICK] label ── */
  if (targetRect && !isSmall) {
    return (
      <div
        ref={cursorRef}
        className="terminal-cursor cursor-locked cursor-click-mode"
        style={{
          width: "auto",
          height: "auto",
        }}
      >
        <span className="bracket click-bracket" style={{ fontSize: "14px" }}>[</span>
        <span className="click-label">CLICK</span>
        <span className="bracket click-bracket" style={{ fontSize: "14px" }}>]</span>
      </div>
    );
  }

  /* ── Small button / default mode: expanding brackets ── */
  const PAD_X = 20;
  const PAD_Y = 8;

  const width = targetRect ? targetRect.width + PAD_X * 2 : 20;
  const height = targetRect ? targetRect.height + PAD_Y * 2 : 20;
  const bracketSize = targetRect ? Math.round(height * 0.92) : 16;

  return (
    <div
      ref={cursorRef}
      className={`terminal-cursor ${targetRect ? "cursor-locked" : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <span className="bracket" style={{ fontSize: `${bracketSize}px` }}>
        [
      </span>

      {targetRect && (
        <>
          <span className="cursor-corner tl">·</span>
          <span className="cursor-corner tr">·</span>
          <span className="cursor-corner bl">·</span>
          <span className="cursor-corner br">·</span>
        </>
      )}

      <span className="bracket" style={{ fontSize: `${bracketSize}px` }}>
        ]
      </span>
    </div>
  );
}
