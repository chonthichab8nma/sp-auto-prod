import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Car, Check, CheckCircle2, Edit2 } from "lucide-react";
import type { Job, StepStatus } from "../Type";

interface StationPageProps {
  job: Job;
  onUpdateStep: (
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employee: string
  ) => void;
}

export default function StationPage({ job, onUpdateStep }: StationPageProps) {
  const navigate = useNavigate();
  const currentStage = job.stages[job.currentStageIndex];

  const initialActiveId =
    currentStage.steps.find((s) => s.status === "pending")?.id ||
    currentStage.steps[0].id;
  const [activeStepId, setActiveStepId] = useState<string>(initialActiveId);

  const activeStep = currentStage.steps.find((s) => s.id === activeStepId);
  const [operatorName, setOperatorName] = useState("");
  const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);

  const handleSave = () => {
    if (!selectedAction || selectedAction === "pending") return;
    if (!operatorName && selectedAction === "completed") {
      alert("กรุณาระบุชื่อผู้ดำเนินการ");
      return;
    }
    onUpdateStep(
      job.currentStageIndex,
      activeStepId,
      selectedAction,
      operatorName
    );

  
    const currentIndex = currentStage.steps.findIndex(
      (s) => s.id === activeStepId
    );
    if (currentIndex < currentStage.steps.length - 1) {
      setActiveStepId(currentStage.steps[currentIndex + 1].id);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-2 mb-4 rounded-t-xl shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">สเตชั่น</h1>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500">รายละเอียด {job.registration}</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium">สถานะ</span>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm mx-0 md:mx-0 overflow-hidden border border-slate-200">

        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Car size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {job.brand} {job.model}
                </h2>
                <p className="text-xs text-slate-500">
                  ขั้นตอนปัจจุบัน: {currentStage.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">ทะเบียนรถ</div>
              <div className="font-bold">{job.registration}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full max-w-md">
            {job.stages.map((stage, idx) => {
              const isActive = idx === job.currentStageIndex;
              const isPassed = stage.isCompleted;
              return (
                <div key={stage.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isPassed
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-1"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPassed ? <Check size={14} /> : idx + 1}
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      isActive || isPassed
                        ? "text-slate-800 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.name.split(". ")[1] || stage.name}
                  </span>
                  {idx < job.stages.length - 1 && (
                    <div className="h-[1px] bg-slate-200 flex-1 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>


        <div className="flex flex-1 min-h-[500px]">

          <div className="w-1/2 border-r border-slate-100 bg-white p-6 overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-6">
              {currentStage.name}
            </h3>
            <div className="relative pl-2">
              <div className="absolute left-[19px] top-2 bottom-0 w-[2px] bg-slate-100" />
              {currentStage.steps.map((step) => {
                const isActive = activeStepId === step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    className={`relative pl-10 pb-6 cursor-pointer group`}
                  >
                    <div
                      className={`absolute left-[15px] top-1 w-2.5 h-2.5 rounded-full z-10 ring-4 ring-white transition-all ${
                        isActive
                          ? "bg-blue-500 scale-125"
                          : step.status === "completed"
                          ? "bg-green-500"
                          : step.status === "skipped"
                          ? "bg-slate-400"
                          : "bg-slate-300"
                      }`}
                    />
                    <div
                      className={`p-4 rounded-lg border transition-all ${
                        isActive
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-transparent border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`font-medium ${
                            isActive
                              ? "text-blue-700"
                              : step.status === "skipped"
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }`}
                        >
                          {step.name}
                        </span>
                        {step.status === "completed" && (
                          <CheckCircle2 size={16} className="text-green-500" />
                        )}
                        {step.status === "skipped" && (
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-2 rounded">
                            ข้าม
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex gap-2">
                        {step.timestamp || "-/-/- -, --:-- น."}
                      </div>
                      {step.employee && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Edit2 size={10} /> {step.employee}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          <div className="w-1/2 bg-slate-50/50 p-6 flex flex-col">
            {activeStep ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-0">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">
                    {activeStep.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      activeStep.status === "pending"
                        ? "bg-orange-100 text-orange-600"
                        : activeStep.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {activeStep.status === "pending"
                      ? "รอดำเนินการ"
                      : activeStep.status === "completed"
                      ? "เสร็จสิ้น"
                      : "ข้าม"}
                  </span>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ผู้ดำเนินการ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ระบุชื่อผู้ดำเนินการ"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      อัปเดตสถานะ
                    </label>
                    <div className="flex gap-4">
                      <label
                        className={`flex-1 border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          selectedAction === "skipped"
                            ? "border-slate-400 bg-slate-50 text-slate-800 ring-1 ring-slate-400"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          className="accent-slate-500 w-4 h-4"
                          checked={selectedAction === "skipped"}
                          onChange={() => setSelectedAction("skipped")}
                        />
                        <span className="text-sm">ข้าม</span>
                      </label>
                      <label
                        className={`flex-1 border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          selectedAction === "completed"
                            ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          className="accent-green-600 w-4 h-4"
                          checked={selectedAction === "completed"}
                          onChange={() => setSelectedAction("completed")}
                        />
                        <span className="text-sm">เสร็จสิ้น</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={!selectedAction}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                กรุณาเลือกรายการทางซ้ายมือ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
