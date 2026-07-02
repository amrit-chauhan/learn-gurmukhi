/**
 * SrBadge – reusable "Smart Review active" indicator.
 *
 * variant="compact"  → tiny "SR" pill (study header, tight spaces)
 * variant="medium"   → "SMART" with Brain icon (default, letter-select)
 * variant="full"     → "SMART REVIEW" text only (mode cards on home)
 */

import React from 'react';
import { Brain } from 'lucide-react';

export default function SrBadge({ variant = 'medium' }) {
  if (variant === 'compact') {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded-full tracking-wide">
        <Brain className="w-2.5 h-2.5" />
        SR
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full tracking-wide">
        SMART REVIEW
      </span>
    );
  }

  // medium (default)
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">
      <Brain className="w-3 h-3" />
      SMART
    </span>
  );
}
