import { ChevronRight } from "lucide-react";
import type { JobApi } from "../../features/jobs/api/job.api";

type JobStatus = "CLAIM" | "REPAIR" | "BILLING" | "DONE";
type StageCode = "claim" | "repair" | "billing";

const STATUS_TO_STAGE_CODE: Record<JobStatus, StageCode | null> = {
  CLAIM: "claim",
  REPAIR: "repair",
  BILLING: "billing",
  DONE: null,
};

export default function StageStepper({
  job,
  checkpointIndex,
}: {
  job: JobApi;
  checkpointIndex?: number;
}) {
  const stages = (job.jobStages ?? [])
    .slice()
    .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);

  const status = (job.status as JobStatus) ?? "CLAIM";
  const activeStageCode = STATUS_TO_STAGE_CODE[status];

  const computedActiveStageIndex =
    activeStageCode === null
      ? -1
      : stages.findIndex((s) => (s.stage.code as StageCode) === activeStageCode);

  const activeStageIndex =
    typeof checkpointIndex === "number" ? checkpointIndex : computedActiveStageIndex;

  return (
    <div className="flex items-center gap-2">
      {stages.map((s, idx) => {
        const isActive = idx === activeStageIndex;
        const isCompleted = Boolean(s.isCompleted);

        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }
                `}
              >
                {idx + 1}
              </div>
              <span
                className={`text-sm font-medium transition-colors
                  ${
                    isCompleted
                      ? "text-slate-900"
                      : isActive
                      ? "text-blue-700"
                      : "text-slate-500"
                  }
                `}
              >
                {s.stage.name}
              </span>
            </div>

            {idx < stages.length - 1 && (
              <ChevronRight size={16} className="mx-2 text-slate-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}
