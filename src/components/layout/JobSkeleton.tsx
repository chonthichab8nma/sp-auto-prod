
import { ChevronLeft, ChevronRight } from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
      aria-hidden
    />
  );
}

export default function JobDetailSkeleton() {
  return (
    <div className="p-6 min-h-screen bg-white">
      {/* ===== Header ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center">
            <ChevronLeft size={18} className="text-slate-300" />
          </div>

          {/* Stages */}
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-16" />
                {i < 4 && (
                  <ChevronRight size={16} className="text-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* ===== Breadcrumb ===== */}
      <div className="mb-6">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* ===== Content ===== */}
      <div className="bg-white py-2 space-y-10">
        {/* ===== Section: Vehicle ===== */}
        <section>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24 mb-6" />

          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>

          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </section>

        {/* ===== Section: Repair ===== */}
        <section>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-32 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))}
          </div>
        </section>

        {/* ===== Section: Customer ===== */}
        <section>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-32 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`space-y-2 ${i === 2 ? "md:col-span-2" : ""}`}
              >
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-full md:w-80" />
              </div>
            ))}
          </div>
        </section>

        {/* ===== Section: Payment ===== */}
        <section>
          <Skeleton className="h-5 w-44 mb-1" />
          <Skeleton className="h-4 w-32 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
