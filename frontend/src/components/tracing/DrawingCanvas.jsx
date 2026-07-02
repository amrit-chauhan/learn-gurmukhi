/**
 * DrawingCanvas
 *
 * A pointer-driven freehand drawing surface for the Writing / Tracing mode.
 * Works with mouse, touch, and stylus via Pointer Events (`touch-action: none`
 * so touch-drags draw instead of scrolling).
 *
 * Clearing is handled by the parent remounting this component with a new React
 * `key` (letter change, sub-mode change, or the Clear button) — keeping this
 * component stateless and self-contained.
 */

import React, { useEffect, useRef } from 'react';

export default function DrawingCanvas({ color = '#1c1917', lineWidth = 8, className = '' }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Size the canvas to its (square) parent, accounting for devicePixelRatio
  // so strokes stay crisp on high-density displays.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const size = parent ? parent.clientWidth : 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;
  }, [color, lineWidth]);

  const pointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = pointFromEvent(e);
    canvasRef.current.setPointerCapture?.(e.pointerId);
    // A single tap should leave a dot.
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const handleMove = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const handleUp = () => {
    drawing.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
      onPointerCancel={handleUp}
      className={className}
      style={{ touchAction: 'none' }}
    />
  );
}
