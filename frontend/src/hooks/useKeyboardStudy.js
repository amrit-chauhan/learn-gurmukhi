/**
 * useKeyboardStudy
 *
 * Binds keyboard shortcuts for the study session:
 *   Space      → reveal answer
 *   ArrowRight → mark correct
 *   ArrowLeft  → mark wrong
 *
 * Cleans up the event listener on unmount or when dependencies change.
 */

import { useEffect } from 'react';

export function useKeyboardStudy({ revealed, done, onReveal, onCorrect, onWrong }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (done) return;
      if (e.code === 'Space' && !revealed) {
        e.preventDefault();
        onReveal();
      } else if (e.code === 'ArrowRight') {
        onCorrect();
      } else if (e.code === 'ArrowLeft') {
        onWrong();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [revealed, done, onReveal, onCorrect, onWrong]);
}
