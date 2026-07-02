/**
 * SessionScore
 *
 * Running correct / wrong tally shown during a study session.
 */

import React from 'react';
import { Check, X } from 'lucide-react';

export default function SessionScore({ correctCount, wrongCount }) {
  return (
    <div className="flex justify-center gap-6 py-2">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600" data-testid="correct-count">
        <Check className="w-4 h-4" />
        {correctCount}
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-red-500" data-testid="wrong-count">
        <X className="w-4 h-4" />
        {wrongCount}
      </div>
    </div>
  );
}
