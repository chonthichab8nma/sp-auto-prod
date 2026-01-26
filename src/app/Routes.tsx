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
import type { StepStatus } from "../Type";
import StationsPage from "../stations/pages/StationPage";
import StationProgressPage from "../stations/pages/StationProgressPage";
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
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employeeId: number | null,
  ) => void;
}) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const {
    data: job,
    loading,
    isRefetching,
    error,
    refetch,
  } = useJobQuery(jobId);

  if (loading && !job) return <JobDetailSkeleton />;

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
      isRefetching={isRefetching}
      onUpdateStep={(stageIdx, stepId, status, employeeId) => {
        onUpdateStep(stageIdx, stepId, status, employeeId);
        refetch();
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
  const updateStep = (
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employeeId: number | null,
  ) => {
    console.log({ stageIdx, stepId, status, employeeId });
  };
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/stations" element={<StationsPage />} />

          <Route path="/create" element={<CreateJobForm />} />

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
