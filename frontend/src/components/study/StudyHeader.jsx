/**
 * StudyHeader
 *
 * Displays the back button, mode label, optional SR badge,
 * card counter, and animated progress bar.
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SrBadge from '../common/SrBadge';
import { MODE_LABELS } from '../../constants/modes';

export default function StudyHeader({ mode, selectedIds, cards, currentIndex, progress, srEnabled }) {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 pb-2 flex items-center gap-3 max-w-md mx-auto w-full">
      <button
        data-testid="study-back-btn"
        onClick={() => navigate('/select', { state: { mode, selectedIds } })}
        className="p-2 rounded-full hover:bg-stone-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-stone-600" />
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">
              {MODE_LABELS[mode] ?? mode}
            </span>
            {srEnabled && <SrBadge variant="compact" />}
          </div>
          <span className="text-xs font-semibold text-stone-600" data-testid="card-counter">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-orange-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>
    </div>
  );
}
