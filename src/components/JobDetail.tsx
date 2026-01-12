import React, { useState } from "react";
import {
  ArrowRight,
  Save,
  Edit3,
  CheckCircle2,
  User,
  Clock,
} from "lucide-react";
import type {  Job, Step, Stage, StepStatus } from "../Type";
import FormInput from "./FormInput";




interface StepRowProps {
  step: Step;
  isLocked: boolean;
  readOnly: boolean;
  canSkip: boolean;
  onUpdate: (stepId: string, status: StepStatus, employee: string) => void;
}
function StepRow({ step, isLocked, readOnly, canSkip, onUpdate }: StepRowProps) {
  const [tempEmp, setTempEmp] = useState(step.employee || "");

  const handleAction = (status: StepStatus) => {
    if (!tempEmp && status === "completed")
      return alert("กรุณาระบุชื่อพนักงานผู้รับผิดชอบ");
    onUpdate(step.id, status, tempEmp || "Unknown");
  };

  return (
    <div className={`p-4 flex flex-col md:flex-row items-start md:items-center gap-4 transition-colors ${step.status === "completed" ? "bg-green-50/50" : step.status === "skipped" ? "bg-slate-100" : "hover:bg-slate-50"}`}>
      <div className="flex-1 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step.status === "completed" ? "bg-green-500 border-green-500 text-white" : step.status === "skipped" ? "bg-slate-300 border-slate-300 text-white" : "border-slate-300 text-transparent bg-white"}`}>
          <CheckCircle2 size={16} />
        </div>
        <span className={`font-medium ${step.status === "skipped" ? "text-slate-400 line-through" : "text-slate-800"}`}>
          {step.name}
        </span>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {(step.status !== "pending" || !readOnly) && (
          <div className="flex flex-col md:flex-row gap-2 text-sm text-slate-500">
            {step.status === "pending" && !readOnly ? (
              <div className="flex items-center bg-white border border-slate-300 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500">
                <User size={14} className="mr-2 text-slate-400" />
                <input type="text" placeholder="ชื่อพนักงาน" className="outline-none w-24 text-slate-700" value={tempEmp} onChange={(e) => setTempEmp(e.target.value)} disabled={isLocked} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs"><User size={12} /> {step.employee}</span>
                {step.timestamp && <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs"><Clock size={12} /> {step.timestamp}</span>}
              </div>
            )}
          </div>
        )}
        {!readOnly && !isLocked && step.status === "pending" && (
          <div className="flex gap-2">
            {canSkip && (
              <button onClick={() => handleAction("skipped")} className="text-xs px-3 py-1 rounded border border-slate-300 text-slate-500 hover:bg-slate-100">ข้าม</button>
            )}
            <button onClick={() => handleAction("completed")} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm">เสร็จสิ้น</button>
          </div>
        )}
        {!readOnly && step.status !== "pending" && (
          <button onClick={() => onUpdate(step.id, "pending", "")} className="text-slate-400 hover:text-red-500 text-xs underline">แก้ไข</button>
        )}
      </div>
    </div>
  );
}


interface StageCardProps {
  stage: Stage;
  isActive: boolean;
  isFinished: boolean;
  onStepUpdate: (stepId: string, status: StepStatus, employee: string) => void;
  onStageComplete: () => void;
}
function StageCard({ stage, isActive, isFinished, onStepUpdate, onStageComplete }: StageCardProps) {
  const allStepsDone = stage.steps.every((s: Step) => s.status !== "pending");
  if (!isActive && !stage.isCompleted && !isFinished) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 opacity-60 flex items-center justify-between">
        <h3 className="font-bold text-slate-500">{stage.name}</h3>
        <span className="text-xs bg-slate-200 px-2 py-1 rounded">รอการดำเนินการ</span>
      </div>
    );
  }
  const isCompletedView = stage.isCompleted || isFinished;
  return (
    <div className={`rounded-xl border shadow-sm transition-all overflow-hidden ${isActive ? "bg-white border-blue-200 ring-4 ring-blue-50/50" : "bg-slate-50 border-slate-200"}`}>
      <div className={`p-4 border-b flex justify-between items-center ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
        <h3 className="font-bold text-lg flex items-center gap-2">
          {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
          {stage.name}
        </h3>
        {isCompletedView && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12} /> เสร็จสิ้น</span>
        )}
      </div>
      <div className="p-0">
        <div className="divide-y divide-slate-100">
          {stage.steps.map((step: Step) => (
            <StepRow key={step.id} step={step} isLocked={!isActive && !isCompletedView} readOnly={isCompletedView} canSkip={stage.id === "repair"} onUpdate={onStepUpdate} />
          ))}
        </div>
      </div>
      {isActive && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button disabled={!allStepsDone} onClick={onStageComplete} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-sm transition-all ${allStepsDone ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
            {stage.id === "billing" ? "จบงาน" : "ไปขั้นตอนถัดไป"} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}



interface JobDetailViewProps {
  job: Job;
  onUpdate: (j: Job) => void;
  onBack: () => void;
}

export default function JobDetail({ job, onUpdate, onBack }: JobDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Job>(job);

  const handleStageComplete = () => {
    const nextIndex = job.currentStageIndex + 1;
    if (nextIndex < job.stages.length) {
      const updatedStages = [...job.stages];
      updatedStages[job.currentStageIndex].isCompleted = true;
      updatedStages[nextIndex].isLocked = false;
      onUpdate({ ...job, stages: updatedStages, currentStageIndex: nextIndex });
    } else {
      const updatedStages = [...job.stages];
      updatedStages[job.currentStageIndex].isCompleted = true;
      onUpdate({ ...job, stages: updatedStages, isFinished: true });
    }
  };

  const updateStep = (stageIdx: number, stepId: string, status: StepStatus, employee: string) => {
    const updatedStages = [...job.stages];
    const stage = updatedStages[stageIdx];
    const step = stage.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = status;
      step.timestamp = status !== "pending" ? new Date().toLocaleString("th-TH") : undefined;
      step.employee = employee;
      onUpdate({ ...job, stages: updatedStages });
    }
  };

  const saveDetails = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 pb-20">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowRight className="rotate-180 mr-1" size={16} /> กลับหน้าหลัก
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              {job.registration}
              <span className={`text-sm px-3 py-1 rounded-full border ${job.paymentType === "Insurance" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                {job.paymentType === "Insurance" ? "ประกันภัย" : "เงินสด"}
              </span>
            </h1>
            <p className="text-slate-500">Job No: {job.bagNumber} | {job.brand} {job.model} ({job.color})</p>
          </div>
          <button onClick={() => (isEditing ? saveDetails() : setIsEditing(true))} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {isEditing ? <><Save size={16} /> บันทึก</> : <><Edit3 size={16} /> แก้ไขข้อมูล</>}
          </button>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
            <FormInput label="ทะเบียน" name="registration" value={editForm.registration} onChange={handleEditChange} />
            <FormInput label="รุ่น" name="model" value={editForm.model} onChange={handleEditChange} />
            <FormInput label="สี" name="color" value={editForm.color} onChange={handleEditChange} />
            <FormInput label="คนรับรถ" name="receiver" value={editForm.receiver} onChange={handleEditChange} />
            <FormInput label="ประเมินเสร็จ" name="estimatedEndDate" value={editForm.estimatedEndDate} onChange={handleEditChange} type="date" />
            <FormInput label="Excess" name="excessFee" value={editForm.excessFee} onChange={handleEditChange} type="number" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div><span className="text-slate-400 block">เริ่มงาน</span> {new Date(job.startDate).toLocaleDateString("th-TH")}</div>
            <div><span className="text-slate-400 block">ประเมินเสร็จ</span> {job.estimatedEndDate ? new Date(job.estimatedEndDate).toLocaleDateString("th-TH") : "-"}</div>
            <div><span className="text-slate-400 block">คนรับรถ</span> {job.receiver}</div>
            <div><span className="text-slate-400 block">Excess</span> {job.excessFee.toLocaleString()} บาท</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 md:px-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
        {job.stages.map((stage, idx) => {
          const isActive = idx === job.currentStageIndex;
          const isDone = idx < job.currentStageIndex || job.isFinished;
          return (
            <div key={stage.id} className="flex flex-col items-center bg-slate-50 p-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${isDone ? "bg-green-500 border-green-500 text-white" : isActive ? "bg-white border-blue-600 text-blue-600" : "bg-white border-slate-300 text-slate-300"}`}>
                {isDone ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <span className={`mt-2 text-sm font-semibold ${isActive ? "text-blue-600" : isDone ? "text-green-600" : "text-slate-400"}`}>
                {stage.id === "claim" ? "เคลม" : stage.id === "repair" ? "ซ่อม" : "ตั้งเบิก"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {job.stages.map((stage, idx) => (
          <StageCard key={stage.id} stage={stage} isActive={idx === job.currentStageIndex && !job.isFinished} isFinished={job.isFinished} onStepUpdate={(stepId, status, emp) => updateStep(idx, stepId, status, emp)} onStageComplete={handleStageComplete} />
        ))}
        {job.isFinished && (
          <div className="bg-green-100 border border-green-300 p-6 rounded-xl text-center text-green-800 font-bold text-xl">🎉 งานนี้เสร็จสมบูรณ์แล้ว</div>
        )}
      </div>
    </div>
  );
}