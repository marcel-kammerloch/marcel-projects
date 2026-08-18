import { Clock } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function SongListBaseSkeleton({ title }: { title?: boolean }) {
  return (
    <div className="flex flex-col gap-2 pb-6 touch-manipulation">
      {/* Sort dropdown skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-2">
        <div>{title && <Skeleton className="h-8 w-40 mb-1" />}</div>
        <Skeleton className="h-8 w-38 rounded-full" />
      </div>

      {/* Table header skeleton */}
      <div className="flex px-1 md:px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        <div className="w-10"></div>
        <div className="w-10 flex items-center justify-start">#</div>
        <div className="flex-1 pr-4">Title</div>
        <div className="hidden sm:block flex-1 pr-4">Artist</div>
        <div className="w-16 flex justify-end">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-10"></div>
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="group flex items-center px-1 md:px-4 py-3 rounded-xl gap-3"
          >
            {/* Drag handle */}
            <div className="w-10 flex items-center justify-center">
              <Skeleton className="h-4 w-4" />
            </div>

            {/* Track number */}
            <div className="w-10">
              <Skeleton className="h-4 w-6" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0 pr-4">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24 sm:hidden" />
            </div>

            {/* Artist (hidden on mobile) */}
            <div className="hidden sm:block flex-1 min-w-0 pr-4">
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Duration */}
            <div className="w-16">
              <Skeleton className="h-4 w-12 ml-auto" />
            </div>

            {/* Info icon */}
            <div className="w-10 flex items-center justify-center">
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
