/**
 * WordFlashcard
 *
 * Flashcard for the Practice Words feature. Same swipe + 3D-flip mechanics as
 * the letter Flashcard, but tuned for words:
 *   - Front: the Gurmukhi spelling of the word
 *   - Back:  romanization (how to say it) + English translation + audio button
 *
 * There is only ever one audio button here (the Punjabi AI voice) since words
 * have no human recordings.
 */

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Volume2 } from 'lucide-react';

const CATEGORY_LABEL = { common: 'common word', days: 'day of week', numbers: 'number' };

export default function WordFlashcard({ word, revealed, onReveal, onCorrect, onWrong, onPlayAudio }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (revealed && !isFlipped) setIsFlipped(true);
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const correctOpacity = useTransform(x, [-50, 0, 80], [0, 0, 1]);
  const wrongOpacity = useTransform(x, [-80, 0, 50], [1, 0, 0]);

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

  const handleTap = (event) => {
    if (event?.target?.closest('button')) return;
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    if (newFlipped && !revealed) onReveal();
  };

  const AudioButton = () => (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={(e) => { e.stopPropagation(); onPlayAudio(word.id); }}
        className="relative p-2.5 rounded-full bg-stone-100 hover:bg-blue-100 transition-colors group"
        data-testid="word-audio-button"
        title="Pronounce (Punjabi voice)"
      >
        <Volume2 className="w-5 h-5 text-stone-600 group-hover:text-blue-600" />
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
      data-testid="word-flashcard"
    >
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
          {/* ── FRONT face — Gurmukhi word ── */}
          <div
            style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="rounded-3xl shadow-2xl border border-stone-100 bg-white overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <AudioButton />
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {CATEGORY_LABEL[word.category] || 'word'}
              </span>
              <p
                className="font-bold text-stone-900 leading-tight text-center mt-4"
                style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif", fontSize: '72px' }}
              >
                {word.gurmukhi}
              </p>
              <span className="absolute bottom-6 text-xs text-stone-300 font-medium select-none">
                tap to flip
              </span>
            </div>
          </div>

          {/* ── BACK face — how to say it + meaning ── */}
          <div
            style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="rounded-3xl shadow-2xl border border-pink-100 bg-white overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <AudioButton />

              {/* Small Gurmukhi reference at top */}
              <p
                className="text-stone-300 leading-none text-center"
                style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif", fontSize: '32px' }}
              >
                {word.gurmukhi}
              </p>

              <div className="w-10 h-px bg-stone-200 my-5" />

              {/* How you say it */}
              <p className="font-bold text-pink-600 leading-none text-center" style={{ fontSize: '40px' }}>
                {word.romanization}
              </p>

              {/* English meaning */}
              <p className="mt-4 text-base text-stone-600 font-semibold text-center">
                {word.translation}
              </p>

              <span className="absolute bottom-6 text-xs text-stone-300 font-medium select-none">
                tap to flip back
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
