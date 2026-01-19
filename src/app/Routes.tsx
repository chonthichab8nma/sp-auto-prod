import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import AppShell from "./AppShell";

import Dashboard from "../features/jobs/pages/Dashboard";
import CreateJobForm from "../features/jobs/pages/CreateJobForm";
import JobDetailPage from "../features/jobs/pages/JobDetailPage";

import StationsPage from "../stations/pages/StationPage";
import StationProgressPage from "../stations/pages/StationProgressPage";

import type { Job, JobFormData, StepStatus } from "../Type";

import { useJobsStore } from "../features/jobs/hooks/useJobsStore";
import JobEditPage from "../features/jobs/pages/JobEditPage";

function JobDetailWrapper({ jobs }: { jobs: Job[] }) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = jobs.find((j) => String(j.id) === String(jobId));

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลรถที่ระบุ</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline font-medium"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return <JobDetailPage job={job} />;
}
function StationWrapper({
  jobs,
  onUpdateStep,
}: {
  jobs: Job[];
  onUpdateStep: (
    jobId: string,
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employee: string
  ) => void;
}) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = jobs.find((j) => String(j.id) === String(jobId));

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลสำหรับตรวจสอบสถานะ</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }
  return (
    <StationProgressPage
      job={job}
      onUpdateStep={(stageIdx, stepId, status, employee) =>
        onUpdateStep(job.id, stageIdx, stepId, status, employee)
      }
    />
  );
}

function JobEditWrapper() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, updateJob } = useJobsStore();

  const job = jobs.find((j) => String(j.id) === String(jobId));

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลรถที่ต้องการแก้ไข</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline font-medium"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
  <JobEditPage
    job={job}
    onCancel={() => navigate(-1)}
    onSave={(updatedJob) => {
      updateJob(updatedJob);
      navigate(-1); // ✅ กลับไป Detail เดิมทันที (ไม่สร้าง Detail ซ้ำ)
    }}
  />
);
}

export default function AppRoutes() {
  const navigate = useNavigate();
  const { jobs, createJob, updateStep } = useJobsStore();
  console.log("jobs in store:", jobs);
  const handleCreateJob = (formData: JobFormData) => {
    createJob(formData);
    navigate("/");
  };

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard jobs={jobs} />} />

        <Route path="/stations" element={<StationsPage jobs={jobs} />} />

        <Route
          path="/create"
          element={
            <CreateJobForm
              onCancel={() => navigate("/")}
              onSubmit={handleCreateJob}
            />
          }
        />

        <Route path="/job/:jobId/edit" element={<JobEditWrapper />} />

        <Route path="/job/:jobId" element={<JobDetailWrapper jobs={jobs} />} />

        <Route
          path="/stations/:jobId"
          element={<StationWrapper jobs={jobs} onUpdateStep={updateStep} />}
        />
      </Route>
    </Routes>
  );
}
