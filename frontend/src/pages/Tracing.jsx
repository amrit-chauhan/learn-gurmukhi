/**
 * Tracing / Writing page
 *
 * Two sub-modes:
 *   - trace: an outlined guide glyph sits under the drawing surface to trace over
 *   - free:  no guide — draw the letter from memory
 * The user draws on a canvas (mouse / touch / stylus), can Clear, Reveal the
 * answer (shown in three Gurmukhi faces to convey real-world variation), and
 * move to the next / previous letter.
 *
 * Letters come from ProgressContext's alphabet, already in pedagogical order
 * (F-002 grouping). This is a frontend-only feature — it records no progress.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eraser, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { WRITING_SUBMODES, WRITING_FONT_VARIANTS } from '../constants/modes';
import DrawingCanvas from '../components/tracing/DrawingCanvas';

// The guide glyph is rendered with the print face as a hollow outline.
const GUIDE_FONT = "'Noto Sans Gurmukhi', sans-serif";

export default function Tracing() {
  const navigate = useNavigate();
  const { alphabet, loading } = useProgress();

  const [index, setIndex] = useState(0);
  const [subMode, setSubMode] = useState('trace'); // 'trace' | 'free'
  const [revealed, setRevealed] = useState(false);
  const [clearNonce, setClearNonce] = useState(0);

  const current = alphabet[index];

  // Remounting the canvas (new key) clears it: on letter change, sub-mode
  // change, or an explicit Clear.
  const canvasKey = useMemo(
    () => `${current?.id ?? 'none'}-${subMode}-${clearNonce}`,
    [current, subMode, clearNonce]
  );

  const goTo = (nextIndex) => {
    const clamped = (nextIndex + alphabet.length) % alphabet.length;
    setIndex(clamped);
    setRevealed(false);
  };

  const selectSubMode = (id) => {
    setSubMode(id);
    setRevealed(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-lg">Loading alphabet…</div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-lg">No letters available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-stone-50/90 backdrop-blur-sm border-b border-stone-100 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            data-testid="back-btn"
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-stone-900">Writing Practice</h1>
            <p className="text-xs text-stone-500">
              {current.name} · {current.romanization}
            </p>
          </div>

          {/* Sub-mode toggle */}
          <div className="flex gap-1 bg-stone-200 rounded-full p-1">
            {WRITING_SUBMODES.map((m) => (
              <button
                key={m.id}
                data-testid={`submode-${m.id}`}
                onClick={() => selectSubMode(m.id)}
                title={m.desc}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  subMode === m.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-8 max-w-2xl mx-auto w-full flex flex-col items-center">
        {/* ── Canvas + guide ───────────────────────────────────────────── */}
        <div
          data-testid="tracing-surface"
          className="relative w-full max-w-[340px] aspect-square mx-auto rounded-3xl bg-white border border-stone-200 shadow-sm overflow-hidden"
        >
          {/* Guide glyph — hollow outline, only in trace mode */}
          {subMode === 'trace' && (
            <div
              data-testid="trace-guide"
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              aria-hidden
              style={{
                fontFamily: GUIDE_FONT,
                fontSize: 'clamp(140px, 55vw, 230px)',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '2px #d6d3d1',
              }}
            >
              {current.gurmukhi}
            </div>
          )}

          {/* Drawing surface on top */}
          <DrawingCanvas key={canvasKey} className="absolute inset-0" />
        </div>

        {/* ── Controls ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mt-5">
          <button
            data-testid="prev-letter-btn"
            onClick={() => goTo(index - 1)}
            className="p-3 rounded-full bg-white border border-stone-200 hover:bg-stone-100 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>

          <button
            data-testid="clear-btn"
            onClick={() => setClearNonce((n) => n + 1)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold text-sm hover:bg-stone-200 active:scale-[0.98] transition-all"
          >
            <Eraser className="w-4 h-4" /> Clear
          </button>

          <button
            data-testid="reveal-btn"
            onClick={() => setRevealed((r) => !r)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {revealed ? 'Hide' : 'Reveal'}
          </button>

          <button
            data-testid="next-letter-btn"
            onClick={() => goTo(index + 1)}
            className="p-3 rounded-full bg-white border border-stone-200 hover:bg-stone-100 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* ── Reveal panel: 3 font variations ──────────────────────────── */}
        {revealed && (
          <div data-testid="reveal-panel" className="mt-6 w-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 text-center mb-3">
              How it can look
            </p>
            <div className="grid grid-cols-3 gap-3">
              {WRITING_FONT_VARIANTS.map((v) => (
                <div
                  key={v.label}
                  className="rounded-2xl bg-white border border-stone-200 p-3 flex flex-col items-center"
                >
                  <span
                    className="text-stone-900"
                    style={{ fontFamily: v.family, fontSize: 'clamp(48px, 16vw, 72px)', lineHeight: 1.1 }}
                  >
                    {current.gurmukhi}
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-stone-500">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Letter strip ─────────────────────────────────────────────── */}
        <div className="mt-7 w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {alphabet.map((l, i) => (
              <button
                key={l.id}
                data-testid={`strip-${l.id}`}
                onClick={() => goTo(i)}
                className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                  i === index
                    ? 'bg-pink-600 border-pink-600 text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
                style={{ fontFamily: GUIDE_FONT, fontSize: 22 }}
              >
                {l.gurmukhi}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
