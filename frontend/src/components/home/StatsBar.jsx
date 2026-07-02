/**
 * StatsBar
 *
 * Three-column summary of studied / mastered / total letter counts
 * shown at the top of the Home page.
 */

import React from 'react';

function StatItem({ value, label, valueClass = 'text-stone-800' }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-stone-500 font-medium">{label}</p>
    </div>
  );
}

export default function StatsBar({ studiedCount, masteredCount, totalLetters }) {
  if (totalLetters === 0) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-5">
      <StatItem value={studiedCount} label="studied" />
      <div className="h-8 w-px bg-stone-200" />
      <StatItem value={masteredCount} label="mastered" valueClass="text-emerald-600" />
      <div className="h-8 w-px bg-stone-200" />
      <StatItem value={totalLetters} label="total" />
    </div>
  );
}
