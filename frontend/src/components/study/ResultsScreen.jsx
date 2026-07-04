/**
 * ResultsScreen
 *
 * Full-screen results view shown after a study session completes.
 * Shows score percentage, list of wrong answers, and action buttons.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Home } from 'lucide-react';

export default function ResultsScreen({ sessionResults, correctCount, mode, onStudyAgain, onChangeSelection }) {
  const navigate = useNavigate();
  const changeSelection = onChangeSelection || (() => navigate('/select', { state: { mode } }));
  const wrongOnes = sessionResults.filter((r) => !r.correct);
  const pct = sessionResults.length === 0 ? 0 : Math.round((correctCount / sessionResults.length) * 100);
  const encouragement =
    sessionResults.length === 0
      ? 'Keep practising!'
      : pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort!' : 'Keep practising!';

  return (
    <div
      className="min-h-screen bg-stone-50 flex flex-col items-center px-5 pt-12 pb-8"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Score */}
        <div className="text-center mb-8">
          <div className="text-6xl font-extrabold text-stone-900">{pct}%</div>
          <div className="text-lg font-semibold text-stone-600 mt-1">
            {correctCount}/{sessionResults.length} correct
          </div>
          <div className="mt-2 text-sm text-stone-400">{encouragement}</div>
        </div>

        {/* Wrong answers */}
        {wrongOnes.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
              Review these ({wrongOnes.length})
            </p>
            <div className="space-y-2">
              {wrongOnes.map(({ letter }) => (
                <div
                  key={letter.id}
                  className="flex items-center gap-4 bg-white rounded-xl border border-red-100 px-4 py-3"
                >
                  <span
                    className="text-3xl font-bold text-stone-900 w-12 text-center"
                    style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}
                  >
                    {letter.gurmukhi}
                  </span>
                  <div>
                    <p className="font-semibold text-stone-800">{letter.romanization}</p>
                    <p className="text-xs text-stone-400">
                      {letter.translation
                        ? letter.translation
                        : `${letter.name} · ${letter.category.replace(/_/g, ' ')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            data-testid="study-again-btn"
            onClick={onStudyAgain}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-orange-500 text-white font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Study Again
          </button>
          <button
            data-testid="change-selection-btn"
            onClick={changeSelection}
            className="w-full py-4 bg-white border border-stone-200 text-stone-700 font-semibold rounded-2xl active:scale-[0.98] transition-all"
          >
            Change Selection
          </button>
          <button
            data-testid="go-home-btn"
            onClick={() => navigate('/')}
            className="w-full py-3 text-stone-400 font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
