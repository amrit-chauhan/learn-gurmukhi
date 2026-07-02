import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Volume2 } from 'lucide-react';

export default function Flashcard({ letter, mode, revealed, onReveal, onCorrect, onWrong, onPlayAudio }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Sync with parent revealed state (e.g. keyboard Space bar triggers reveal)
  useEffect(() => {
    if (revealed && !isFlipped) setIsFlipped(true);
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const correctOpacity = useTransform(x, [-50, 0, 80], [0, 0, 1]);
  const wrongOpacity = useTransform(x, [-80, 0, 50], [1, 0, 0]);

  const frontIsGurmukhi = mode === 'gurmukhi_to_sound';
  const frontText = frontIsGurmukhi ? letter.gurmukhi : letter.romanization;
  const backText = frontIsGurmukhi ? letter.romanization : letter.gurmukhi;
  const backIsGurmukhi = !frontIsGurmukhi;
  const hasHuman = !!letter.has_human_audio;

  const handleDragEnd = (event, info) => {
    const THRESHOLD = 80;
    if (info.offset.x > THRESHOLD) {
      animate(x, 600, { duration: 0.25, ease: 'easeOut', onComplete: onCorrect });
    } else if (info.offset.x < -THRESHOLD) {
      animate(x, -600, { duration: 0.25, ease: 'easeOut', onComplete: onWrong });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  // framer-motion onTap only fires for genuine taps (not drags).
  // Guard against the audio buttons: if the tap target is a button, do nothing.
  const handleTap = (event) => {
    if (event?.target?.closest('button')) return;
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    if (newFlipped && !revealed) onReveal();
  };

  const AudioButtons = () => (
    <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
      {/* Human voice button — only shown when human audio exists */}
      {hasHuman && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlayAudio(letter.id, 'human'); }}
          className="relative p-2.5 rounded-full bg-stone-100 hover:bg-emerald-100 transition-colors group"
          data-testid="audio-button-human"
          title="Human voice"
        >
          <Volume2 className="w-5 h-5 text-stone-600 group-hover:text-emerald-700" />
          {/* Small "H" badge */}
          <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none pointer-events-none">
            H
          </span>
        </button>
      )}

      {/* AI voice button — always shown */}
      <button
        onClick={(e) => { e.stopPropagation(); onPlayAudio(letter.id, 'ai'); }}
        className="relative p-2.5 rounded-full bg-stone-100 hover:bg-blue-100 transition-colors group"
        data-testid={hasHuman ? "audio-button-ai" : "audio-button"}
        title="AI voice"
      >
        <Volume2 className={`w-5 h-5 ${hasHuman ? 'text-stone-500 group-hover:text-blue-600' : 'text-stone-600'}`} />
        {/* "AI" badge */}
        <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold bg-blue-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none pointer-events-none">
          AI
        </span>
      </button>
    </div>
  );

  return (
    <motion.div
      drag="x"
      dragElastic={0.7}
      style={{ x, rotate, touchAction: 'none' }}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      className="relative w-full max-w-[340px] mx-auto cursor-grab active:cursor-grabbing"
      data-testid="flashcard"
    >
      {/* Swipe indicators – float above the 3D card */}
      <motion.div
        style={{ opacity: correctOpacity }}
        className="absolute top-5 left-5 z-20 px-3 py-1.5 bg-emerald-100 border-2 border-emerald-500 rounded-full pointer-events-none"
      >
        <span className="text-emerald-700 font-bold text-sm tracking-wide">CORRECT</span>
      </motion.div>
      <motion.div
        style={{ opacity: wrongOpacity }}
        className="absolute top-5 right-5 z-20 px-3 py-1.5 bg-red-100 border-2 border-red-500 rounded-full pointer-events-none"
      >
        <span className="text-red-700 font-bold text-sm tracking-wide">WRONG</span>
      </motion.div>

      {/* 3D flip stage */}
      <div style={{ perspective: '1200px', height: 420 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            willChange: 'transform',
          }}
        >

          {/* ── FRONT face ── */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="rounded-3xl shadow-2xl border border-stone-100 bg-white overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <AudioButtons />

              <span
                className="text-xs font-semibold uppercase tracking-widest text-stone-400"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {letter.category.replace(/_/g, ' ')}
              </span>

              <p
                className="font-bold text-stone-900 leading-none text-center mt-4"
                style={{
                  fontFamily: frontIsGurmukhi ? "'Noto Sans Gurmukhi', sans-serif" : "'Manrope', sans-serif",
                  fontSize: frontIsGurmukhi ? '96px' : '32px',
                }}
              >
                {frontText}
              </p>

              <span
                className="absolute bottom-6 text-xs text-stone-300 font-medium select-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                tap to flip
              </span>
            </div>
          </div>

          {/* ── BACK face ── */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="rounded-3xl shadow-2xl border border-pink-100 bg-white overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <AudioButtons />

              {/* Small question reference at top */}
              <p
                className="text-stone-300 leading-none text-center"
                style={{
                  fontFamily: frontIsGurmukhi ? "'Noto Sans Gurmukhi', sans-serif" : "'Manrope', sans-serif",
                  fontSize: frontIsGurmukhi ? '32px' : '16px',
                }}
              >
                {frontText}
              </p>

              <div className="w-10 h-px bg-stone-200 my-5" />

              {/* Large answer */}
              <p
                className="font-bold text-pink-600 leading-none text-center"
                style={{
                  fontFamily: backIsGurmukhi ? "'Noto Sans Gurmukhi', sans-serif" : "'Manrope', sans-serif",
                  fontSize: backIsGurmukhi ? '80px' : '40px',
                }}
              >
                {backText}
              </p>

              <p
                className="mt-3 text-sm text-stone-500 font-medium"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {letter.name}
              </p>

              <span
                className="absolute bottom-6 text-xs text-stone-300 font-medium select-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                tap to flip back
              </span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
