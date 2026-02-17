import { useNavigate } from "react-router-dom";
import { Car, Check, Printer } from "lucide-react";
import toast from "react-hot-toast";

import type { StepStatus } from "../../Type";
import type { JobApi } from "../../features/jobs/api/job.api";

import StageStepper from "../components/StageStepper";
import StepTimeline from "../components/StepTimeline";
import StepActionPanel from "../components/StepActionPanel";
import ProgressHeader from "../components/ProgressHeader";
import type { EmployeeApi } from "../api/employees.api";
import { useStationProgressViewModel } from "../hooks/useStationProgressViewModel";

export default function StationProgressPage({
  job,
  onUpdateStep,
}: {
  job: JobApi;
  isRefetching?: boolean;
  onUpdateStep: (
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employeeId: number | null,
  ) => void;
}) {
  const navigate = useNavigate();
  const {
    jobState,
    logoLoadError,
    setLogoLoadError,
    checkpointIndex,
    setCheckpointIndex,
    setFollowMode,
    stages,
    isStageDone,
    stepsVm,
    activeStepId,
    activeStep,
    selectedEmployee,
    setSelectedEmployee,
    selectedAction,
    setSelectedAction,
    error,
    saving,
    showBulkSkipConfirm,
    setShowBulkSkipConfirm,
    isRepairStage,
    stepsToSkip,
    canPrintBillingPdf,
    brandLogoUrl,
    isDoneStatus,
    handleDownloadPdf,
    handleBulkSkip,
    handleSave,
    handleSelectStep,
  } = useStationProgressViewModel({ job, onUpdateStep });

  return (
    <div className="w-full max-w-full min-h-screen bg-[#ebebeb] text-slate-800">
      <div className="mb-3 md:mb-6">
        <ProgressHeader
        registration={jobState.vehicle.registration}
        status={jobState.status}
        onBack={() => navigate(-1)}
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
          <div className="w-full xl:w-auto min-w-0">
            <div className="flex gap-4 w-full xl:w-auto min-w-0">
              <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white shrink-0 overflow-hidden">
                {brandLogoUrl && !logoLoadError ? (
                  <img
                    src={brandLogoUrl}
                    alt={jobState.vehicle.brand || "vehicle brand"}
                    className="h-9 w-9 object-contain"
                    onError={() => setLogoLoadError(true)}
                  />
                ) : (
                  <Car size={24} className="text-slate-800" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
                  {jobState.vehicle.brand}
                </h2>
                <p className="text-slate-500 text-sm truncate">
                  {jobState.vehicle.model}
                </p>
              </div>
            </div>

            <div className="mt-4 xl:mt-6 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
              <StageStepper
                job={jobState}
                checkpointIndex={checkpointIndex}
                onChange={(idx) => {
                  setFollowMode(false);
                  if (isDoneStatus) {
                    setCheckpointIndex(idx);
                    return;
                  }

                  if (idx <= checkpointIndex) {
                    setCheckpointIndex(idx);
                    return;
                  }

                  if (!isStageDone) {
                    toast.error(
                      "กรุณาดำเนินการในขั้นตอนปัจจุบันให้ครบถ้วนก่อนไปยังขั้นตอนถัดไป",
                    );
                    return;
                  }

                  setCheckpointIndex(idx);
                }}
              />
            </div>
          </div>

          <div className="w-full xl:w-auto xl:text-right border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
            <div className="flex justify-between xl:block items-center mb-4 xl:mb-0">
              <div className="text-xs text-black mb-1">ทะเบียนรถ</div>
              <div className="text-xl font-bold text-slate-900">
                {jobState.vehicle.registration}
              </div>
            </div>

            <div className="mt-4 xl:mt-8 flex gap-3 w-full xl:w-auto">
              {canPrintBillingPdf && (
                <button
                  onClick={handleDownloadPdf}
                  className="flex-1 xl:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  พิมพ์ PDF
                </button>
              )}
              <button
                onClick={() => {
                  setFollowMode(false);
                  setCheckpointIndex((i) => Math.max(0, i - 1));
                }}
                disabled={checkpointIndex <= 0}
                className="flex-1 xl:flex-none px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => {
                  if (!isDoneStatus && !isStageDone) {
                    toast.error(
                      "ต้องทำขั้นตอนของสถานีนี้ให้เสร็จก่อน ถึงจะไปสถานีถัดไปได้",
                    );
                    return;
                  }
                  setCheckpointIndex((i) => Math.min(stages.length - 1, i + 1));
                }}
                disabled={
                  checkpointIndex >= stages.length - 1 ||
                  (!isDoneStatus && !isStageDone)
                }
                className="flex-1 xl:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg
                text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <StepTimeline
            title={stages[checkpointIndex]?.stage.name ?? "รายการ"}
            steps={stepsVm}
            activeStepId={activeStepId}
            onSelectStep={handleSelectStep}
          />
        </div>

        <div
          id="action-panel-section"
          className="xl:col-span-1 xl:sticky xl:top-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {jobState.status === "DONE" ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                  <Check size={40} className="text-green-500" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  ซ่อมเสร็จสมบูรณ์
                </h3>
                <p className="text-slate-500 text-sm max-w-60">
                  งานนี้ได้รับการบันทึกข้อมูลทุกขั้นตอนเรียบร้อยแล้ว
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                >
                  กลับไปหน้าแดชบอร์ด
                </button>
              </div>
            ) : activeStep ? (
              <StepActionPanel
                stepId={activeStep.id}
                stepName={activeStep.name}
                stepStatus={activeStep.status}
                initialRemark={activeStep.remark}
                
                selectedEmployee={selectedEmployee}
                onSelectEmployee={(emp: EmployeeApi | null) => {
                  setSelectedEmployee(emp);
                }}
                selectedAction={selectedAction}
                onSelectAction={setSelectedAction}
                error={error}
                onSave={handleSave}
                saving={saving}
                canSkip={
                  activeStep.isSkippable &&
                  jobState.status !== "CLAIM" &&
                  jobState.status !== "BILLING"
                }
                skipLabel={
                  isRepairStage && stepsToSkip.length > 0 ? "ข้าม" : "ข้าม"
                }
                onBulkSkip={
                  isRepairStage && stepsToSkip.length > 0
                    ? () => setShowBulkSkipConfirm(true)
                    : undefined
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 xl:h-100 text-slate-400 text-sm p-6 text-center bg-slate-50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                  <Car size={20} className="text-slate-300" />
                </div>
                <p>
                  เลือกรายการทางซ้ายมือ
                  <br />
                  เพื่ออัปเดตสถานะ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showBulkSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ยืนยันข้ามขั้นตอน
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              ระบบจะข้าม {stepsToSkip.length} ขั้นตอน และไปยังขั้นตอน QC โดยตรง
              <br />
              ขั้นตอนที่เสร็จสิ้นแล้วจะไม่ถูกเปลี่ยนแปลง
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkSkipConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBulkSkip}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
