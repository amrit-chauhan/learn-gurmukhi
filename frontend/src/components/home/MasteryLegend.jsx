/**
 * MasteryLegend
 *
 * Colour-coded legend explaining what each mastery level means.
 * Displayed on the Home page as a reference card.
 */

import React from 'react';
import { BarChart2 } from 'lucide-react';

const LEGEND_ITEMS = [
  { color: 'bg-emerald-500', label: 'Mastered',   desc: '10/10 in last 10' },
  { color: 'bg-amber-500',   label: 'Learning',   desc: '≤3 wrong in last 10' },
  { color: 'bg-red-500',     label: 'Struggling', desc: '>3 wrong in last 10' },
  { color: 'bg-stone-300',   label: 'New',        desc: 'Not yet attempted' },
];

export default function MasteryLegend() {
  return (
    <div className="mt-4 rounded-2xl bg-white border border-stone-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-stone-400" />
        <span className="text-sm font-semibold text-stone-600">Letter colours</span>
      </div>
      <div className="space-y-2">
        {LEGEND_ITEMS.map(({ color, label, desc }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
            <span className="text-sm font-medium text-stone-700">{label}</span>
            <span className="text-xs text-stone-400 ml-auto">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
