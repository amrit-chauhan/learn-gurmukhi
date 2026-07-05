/**
 * HomeSkeleton
 *
 * Structural placeholder for the Home screen, shown while first-load data
 * (profiles / alphabet / progress) is still in flight. Rendering the real
 * layout's shape — header, stat bar, mode cards — makes the load feel faster
 * than a blank screen or a bare spinner, because the user sees where content
 * will land before it arrives.
 */

import React from 'react';
import { Skeleton } from '../ui/skeleton';

function ModeCardSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-white border border-stone-100 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export default function HomeSkeleton() {
  return (
    <div
      className="min-h-screen bg-stone-50 flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif" }}
      data-testid="home-skeleton"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Learn Punjabi
        </h1>
        <p className="mt-2 text-base text-stone-500 font-medium">
          Master the Gurmukhi alphabet
        </p>

        {/* Stat bar placeholder */}
        <div className="mt-5 flex items-center justify-center gap-5">
          <Skeleton className="h-12 w-14 rounded-lg" />
          <div className="h-8 w-px bg-stone-200" />
          <Skeleton className="h-12 w-14 rounded-lg" />
          <div className="h-8 w-px bg-stone-200" />
          <Skeleton className="h-12 w-14 rounded-lg" />
        </div>
      </div>

      {/* Mode cards */}
      <div className="flex-1 px-5 pb-8 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div className="flex justify-center">
          <Skeleton className="h-3.5 w-40" />
        </div>
        <ModeCardSkeleton />
        <ModeCardSkeleton />
        <ModeCardSkeleton />
        <ModeCardSkeleton />
      </div>
    </div>
  );
}
