import { Check, Plus } from "lucide-react";
import type { StepStatus } from "../../Type";
import { formatThaiDateTime } from "../../shared/lib/date";

export type StepVM = {
  id: string;
  name: string;
  status: StepStatus;
  timestamp?: string | null;
  employee?: { name: string }
  isSkippable?: boolean;
};

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        เสร็จสิ้น
      </span>
    );
  }

  if (status === "skipped") {
    return (
      <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
        ข้าม
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
  steps: StepVM[];
  activeStepId: string;
  onSelectStep: (id: string) => void;
}) {
  return (
    <div className="pb-4">
      <div className="px-6 py-5 bg-white border-b border-slate-100 mb-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="px-6 py-2">
        {steps.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm">ไม่พบรายการในขั้นตอนนี้</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-7.25 top-7.5 bottom-7.5 w-0.5 bg-slate-100" />

            <div className="space-y-1">
              {steps.map((step) => {
                const isActive = step.id === activeStepId;
                const isCompleted = step.status === "completed";

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
                }

                return (
                  <div
                    key={step.id}
                    onClick={() => onSelectStep(step.id)}
                    className={`
                      relative group flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all border border-transparent
                      ${isActive
                        ? "border-slate-100"
                        : ""
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
                            className={`text-sm font-medium ${isCompleted
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
                          {formatThaiDateTime(step.timestamp)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ผู้ดำเนินการ:{" "}
                          <span className="font-medium text-slate-700">
                            {step.employee?.name ?? "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
