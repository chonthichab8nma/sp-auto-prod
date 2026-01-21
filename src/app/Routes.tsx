import {
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import AppShell from "./AppShell";

import Dashboard from "../features/jobs/pages/Dashboard";
import CreateJobForm from "../features/jobs/pages/CreateJobForm";
import JobDetailPage from "../features/jobs/pages/JobDetailPage";
import type { JobFormData, StepStatus } from "../Type";
import StationsPage from "../stations/pages/StationPage";
import StationProgressPage from "../stations/pages/StationProgressPage";

import { useJobsStore } from "../features/jobs/hooks/useJobsStore";
import JobEditPage from "../features/jobs/pages/JobEditPage";

import RequireAuth from "../shared/auth/RequireAuth";
import { useAuth } from "../shared/auth/useAuth";
import LoginPage from "../features/auth/pages/LoginPage";
import { useJobQuery } from "../features/jobs/hooks/useJobQuery";
import JobDetailSkeleton from "../components/layout/JobSkeleton";

function JobDetailWrapper() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { data: job, loading, error } = useJobQuery(jobId);

  if (loading) return <JobDetailSkeleton />;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
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
  onUpdateStep,
}: {
  onUpdateStep: (
    jobId: string,
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employee: string,
  ) => void;
}) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { data: job, loading, error } = useJobQuery(jobId);

  if (loading) return <JobDetailSkeleton />;

  if (error || !job) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">
          {error || "ไม่พบข้อมูลสำหรับตรวจสอบสถานะ"}
        </p>
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
        onUpdateStep(String(job.id), stageIdx, stepId, status, employee)
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
        navigate(-1);
      }}
    />
  );
}

function LoginGate() {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function AppRoutes() {
  const navigate = useNavigate();
  
const updateStep = ( jobId: string,
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employee: string,) => {
       console.log({jobId,stageIdx,stepId,status,employee})
    }
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/stations" element={<StationsPage />} />

          <Route
            path="/create"
            element={
              <CreateJobForm
                
  
              />
            }
          />

          <Route path="/job/:jobId/edit" element={<JobEditWrapper />} />

          <Route path="/job/:jobId" element={<JobDetailWrapper />} />

        
          <Route
            path="/stations/:jobId"
            element={<StationWrapper onUpdateStep={updateStep} />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
