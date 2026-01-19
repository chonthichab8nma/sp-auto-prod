import { Check, Plus, SkipForward } from "lucide-react";
import type { Job, StepStatus } from "../../Type";

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        เสร็จสิ้น
      </span>
    );
  }
  return null;
}

export default function StepTimeline({
  title,
  steps,
  activeStepId,
  onSelectStep,
}: {
  title: string;
  steps: Job["stages"][number]["steps"];
  activeStepId: string;
  onSelectStep: (id: string) => void;
}) {
  return (
    <div className="pb-4">
      <div className="px-6 py-5 border-b border-slate-100 mb-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="px-6 py-2">
        <div className="relative pl-2">
          <div className="absolute left-3.75 top-4 bottom-4 w-0.5 bg-slate-100" />

          <div className="space-y-1">
            {steps.map((step) => {
              const isActive = step.id === activeStepId;
              const isCompleted = step.status === "completed";
              const isSkipped = step.status === "skipped";

              let Icon = Plus;
              let iconColor = "text-slate-400";
              let dotColor = "bg-white border-slate-200";

              if (isCompleted) {
                Icon = Check;
                iconColor = "text-white";
                dotColor = "bg-green-500 border-green-500";
              } else if (isActive) {
                Icon = Plus;
                iconColor = "text-blue-600";
                dotColor = "bg-blue-50 border-blue-200";
              } else if (isSkipped) {
                // Logic for skipped icon if needed
              }

              return (
                <div
                  key={step.id}
                  onClick={() => onSelectStep(step.id)}
                  className={`
                    relative group flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all border border-transparent
                    ${
                      isActive
                        ? "bg-slate-50 border-slate-100"
                        : "hover:bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${dotColor}`}
                    >
                      <Icon size={14} className={iconColor} strokeWidth={3} />
                    </div>

                    <div>
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${
                            isCompleted
                              ? "text-slate-900"
                              : isActive
                              ? "text-blue-700"
                              : "text-slate-600"
                          }`}
                        >
                          {step.name}
                        </span>
                        <StatusBadge status={step.status} />
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        {step.timestamp || "-/-/- -, --:-- น."}
                      </div>
                    </div>
                  </div>

                  {isActive && !isCompleted && !isSkipped && (
                    <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
                      <SkipForward size={12} className="text-slate-400" />
                      ข้าม
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
