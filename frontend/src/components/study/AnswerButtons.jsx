/**
 * AnswerButtons
 *
 * Wrong / Correct action buttons shown after the card is revealed.
 * Also renders the keyboard shortcut hint.
 */

import React from 'react';
import { Check, X } from 'lucide-react';

export default function AnswerButtons({ onCorrect, onWrong }) {
  return (
    <div className="px-5 pb-8 max-w-md mx-auto w-full">
      <div className="flex gap-3">
        <button
          data-testid="wrong-btn"
          onClick={onWrong}
          className="flex-1 py-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-600 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
          Wrong
        </button>
        <button
          data-testid="correct-btn"
          onClick={onCorrect}
          className="flex-1 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-600 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Check className="w-5 h-5" />
          Correct
        </button>
      </div>
      <p className="text-center text-xs text-stone-400 mt-3">
        ← left arrow = wrong · right arrow = correct
      </p>
    </div>
  );
}
