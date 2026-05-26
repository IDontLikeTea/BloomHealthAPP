'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gray-200',
        className
      )}
    />
  );
}

export function TrackerSkeleton() {
  return (
    <div className="w-80 h-80 sm:w-96 sm:h-96 mx-auto flex items-center justify-center">
      <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gray-200 animate-pulse" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-100">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function MealItemSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
