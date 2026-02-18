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
  const handleStageChange = (idx: number) => {
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
  };

  return (
    <div className="w-full max-w-full min-h-screen bg-[#ebebeb] p-3 text-slate-800 md:p-0">
      <div className="mb-3 md:mb-6">
        <ProgressHeader
        registration={jobState.vehicle.registration}
        status={jobState.status}
        onBack={() => navigate(-1)}
        />
      </div>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:mb-6 md:rounded-xl md:p-6">
        <div className="flex flex-col justify-between items-start gap-0 md:gap-3 xl:flex-row xl:gap-6">
          <div className="w-full xl:w-auto min-w-0">
            <div className="flex w-full min-w-0 gap-3 xl:w-auto xl:gap-4">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white flex items-center justify-center md:h-12 md:w-12">
                {brandLogoUrl && !logoLoadError ? (
                  <img
                    src={brandLogoUrl}
                    alt={jobState.vehicle.brand || "vehicle brand"}
                    className="h-8 w-8 object-contain md:h-9 md:w-9"
                    onError={() => setLogoLoadError(true)}
                  />
                ) : (
                  <Car size={22} className="text-slate-800 md:h-6 md:w-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-1">
                  <h2 className="col-start-1 row-start-1 truncate pb-0.5 text-base font-bold leading-normal text-slate-900 md:text-lg">
                    {jobState.vehicle.brand}
                  </h2>

                  <div className="col-start-2 row-start-1 min-w-0 self-center overflow-x-auto pb-0.5 hide-scrollbar md:hidden">
                    <StageStepper
                      job={jobState}
                      checkpointIndex={checkpointIndex}
                      onChange={handleStageChange}
                    />
                  </div>

                  <p className="col-start-1 row-start-2 truncate text-[13px] text-slate-500 md:text-sm">
                    {jobState.vehicle.model}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 hidden overflow-x-auto pb-1 hide-scrollbar md:block xl:mt-6 xl:pb-0">
              <StageStepper
                job={jobState}
                checkpointIndex={checkpointIndex}
                onChange={handleStageChange}
              />
            </div>
          </div>

          <div className="mt-2 w-full border-t border-slate-200/80 pt-4 xl:mt-0 xl:w-auto xl:border-t-0 xl:pt-0 xl:text-right">
            <div className="mb-4 hidden items-center justify-between md:flex xl:mb-0 xl:block">
              <div className="mb-1 text-xs text-black">ทะเบียนรถ</div>
              <div className="text-lg font-bold text-slate-900 md:text-xl">
                {jobState.vehicle.registration}
              </div>
            </div>

            <div className="mt-1 grid w-full grid-cols-2 gap-2 md:mt-4 xl:mt-8 xl:flex xl:w-auto xl:gap-3">
              {canPrintBillingPdf && (
                <button
                  onClick={handleDownloadPdf}
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 md:text-sm xl:col-span-1 xl:flex-none xl:rounded-lg xl:py-2"
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
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 md:text-sm xl:flex-none xl:rounded-lg xl:py-2"
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
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-medium text-white
                shadow-sm shadow-blue-200 hover:bg-blue-700 md:text-sm xl:flex-none xl:rounded-lg xl:py-2
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
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
