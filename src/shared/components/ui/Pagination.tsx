import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function buildPages(current: number, total: number, siblingCount = 1) {
  if (total <= 0) return [];

  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  const c = clamp(current, 1, total);

  const maxButtons = 7;
  if (total <= maxButtons)
    return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(2, c - siblingCount);
  const right = Math.min(total - 1, c + siblingCount);

  const pages: (number | "dots")[] = [1];

  if (left > 2) pages.push("dots");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("dots");

  pages.push(total);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onGoTo,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: {
  currentPage: number;
  totalPages: number;
  onGoTo: (p: number) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}) {
  const pages = buildPages(currentPage, totalPages, 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={onFirst}
        disabled={currentPage === 1 || totalPages <= 1}
        className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronsLeft size={18} />
      </button>

      <button
        onClick={onPrev}
        disabled={currentPage === 1 || totalPages <= 1}
        className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="max-w-full overflow-x-auto">
        <div className="flex items-center gap-1.5 mx-2 whitespace-nowrap">
          {pages.map((p, idx) =>
            p === "dots" ? (
              <span
                key={`dots-${idx}`}
                className="px-2 text-slate-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onGoTo(p)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] text-sm font-medium transition-all border shrink-0 ${
                  p === currentPage
                    ? "bg-[#F0F5FF] text-blue-600 border-blue-100 shadow-sm"
                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>

      <button
        onClick={onLast}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  );
}
