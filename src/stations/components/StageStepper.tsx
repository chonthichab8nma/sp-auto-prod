import type { Job } from "../../Type";
import { ChevronRight } from "lucide-react";

export default function StageStepper({ job }: { job: Job }) {
  return (
    <div className="flex items-center gap-2">
      {job.stages.map((stage, idx) => {
        const isActive = idx === job.currentStageIndex;

        return (
          <div key={stage.id} className="flex items-center">
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
                  isActive ? "text-blue-700" : "text-slate-500"
                }`}
              >
                {stage.name.replace(/^\d+\.\s*/, "")}
              </span>
            </div>

            {idx < job.stages.length - 1 && (
              <ChevronRight size={16} className="text-slate-300 mx-3" />
            )}
          </div>
        );
      })}
    </div>
  );
}
