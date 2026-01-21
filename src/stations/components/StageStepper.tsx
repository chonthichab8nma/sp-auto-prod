import { ChevronRight } from "lucide-react";
import type { JobApi } from "../../features/jobs/api/job.api";

export default function StageStepper({ job }: { job: JobApi }) {
  const stages = (job.jobStages ?? [])
    .slice()
    .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);

  return (
    <div className="flex items-center gap-2">
      {stages.map((s, idx) => {
        const isActive = idx === (job.currentStageIndex ?? 0);
        const isCompleted = s.isCompleted;

        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }
                `}
              >
                {idx + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCompleted ? "text-green-700" : isActive ? "text-blue-700" : "text-slate-500"
                }`}
              >
                {s.stage.name.replace(/^\d+\.\s*/, "")}
              </span>
            </div>

            {idx < stages.length - 1 && (
              <ChevronRight size={16} className="text-slate-300 mx-3" />
            )}
          </div>
        );
      })}
    </div>
  );
}
