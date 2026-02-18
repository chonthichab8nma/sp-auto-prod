import { ChevronRight } from "lucide-react";
import type { JobApi } from "../../features/jobs/api/job.api";
import { isStageCompletedByProgress } from "../../features/jobs/lib/stage";

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
  onChange,
}: {
  job: JobApi;
  checkpointIndex?: number;
  onChange?: (index: number) => void;
}) {
  const stages = (job.jobStages ?? [])
    .slice()
    .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);

  const status = (job.status as JobStatus) ?? "CLAIM";
  const activeStageCode = STATUS_TO_STAGE_CODE[status];

  const computedActiveStageIndex =
    activeStageCode === null
      ? -1
      : stages.findIndex(
          (s) => (s.stage.code as StageCode) === activeStageCode,
        );

  const activeStageIndex =
    typeof checkpointIndex === "number"
      ? checkpointIndex
      : computedActiveStageIndex;

  return (
    <div className="inline-flex w-fit items-center gap-0 md:gap-2">
      {stages.map((s, idx) => {
        const isActive = idx === activeStageIndex;
        const isCompleted = isStageCompletedByProgress(s, job.status);

        return (
          <div key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onChange?.(idx)}
              className="flex items-center gap-1 text-left md:gap-2"
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-colors md:h-6 md:w-6 md:text-xs
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
                className={`text-[11px] font-medium transition-colors md:text-sm
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

              {isActive && (
                <span className="ml-0 text-[9px] font-semibold text-blue-600 md:ml-auto md:text-xs">
                  ●
                </span>
              )}
            </button>

            {idx < stages.length - 1 && (
              <ChevronRight size={10} className="mx-0 text-slate-300 md:mx-2 md:h-4 md:w-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
