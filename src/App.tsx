import "./App.css";
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router";
import Station from "./components/Station";
import Dashboard from "./components/Dashboard";
import JobDetail from "./components/JobDetailPage";
import StationPage from "./components/StationPage";
import Sidebar from "./components/Sidebar";
import CreateJobForm from "./components/CreateJobForm";

import { type Job, type JobFormData, type StepStatus } from "./Type";
import { INITIAL_STAGES, MOCK_JOBS } from "./data";

function JobDetailWrapper({
  jobs,
  onUpdate,
}: {
  jobs: Job[];
  onUpdate: (j: Job) => void;
}) {
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
  return <JobDetail job={job} onUpdate={onUpdate} />;
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
    <StationPage
      job={job}
      onUpdateStep={(stageIdx, stepId, status, employee) =>
        onUpdateStep(job.id, stageIdx, stepId, status, employee)
      }
    />
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [jobs, setJobs] = useState<Job[]>(() => {
    const savedJobs = localStorage.getItem("job_form");
    return savedJobs ? JSON.parse(savedJobs) : MOCK_JOBS;
  });

  useEffect(() => {
    localStorage.setItem("job_form", JSON.stringify(jobs));
  }, [jobs]);

  const handleLogout = () => {
    console.log("Logout clicked (No Auth mode)");
    navigate("/");
  };

  const handleCreateJob = (formData: JobFormData) => {
    const newStages = INITIAL_STAGES.map((stage) => ({
      ...stage,
      steps: stage.steps.map((step) => ({ ...step })),
    }));

    const newJob: Job = {
      ...formData,
      id: Date.now().toString(),
      stages: newStages,
      currentStageIndex: 0,
      isFinished: false,
    };

    setJobs((prevJobs) => [newJob, ...prevJobs]);
    navigate("/");
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleUpdateStep = (
    jobId: string,
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employee: string
  ) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;

        const newJob = { ...job };
        newJob.stages = [...job.stages];
        const stage = newJob.stages[stageIdx];
        stage.steps = [...stage.steps];

        const stepIndex = stage.steps.findIndex((s) => s.id === stepId);

        if (stepIndex !== -1) {
          stage.steps[stepIndex] = {
            ...stage.steps[stepIndex],
            status,
            employee,
            timestamp: new Date().toLocaleString("th-TH", {
              dateStyle: "short",
              timeStyle: "short",
            }),
          };

          const allDone = stage.steps.every(
            (s) => s.status === "completed" || s.status === "skipped"
          );
          if (allDone) {
            stage.isCompleted = true;

            if (stageIdx + 1 < newJob.stages.length) {
              newJob.stages[stageIdx + 1].isLocked = false;
              newJob.currentStageIndex = stageIdx + 1;
            } else {
              newJob.isFinished = true;
            }
          }
        }
        return newJob;
      })
    );
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        onLogout={handleLogout}
        activePath={location.pathname}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-10 font-sans">
          <Routes>

            <Route path="/" element={<Dashboard jobs={jobs} />} />

            <Route path="/stations" element={<Station jobs={jobs} />} />

            <Route
              path="/create"
              element={
                <CreateJobForm
                  onCancel={() => navigate("/")}
                  onSubmit={handleCreateJob}
                />
              }
            />

            <Route
              path="/job/:jobId"
              element={
                <JobDetailWrapper jobs={jobs} onUpdate={handleUpdateJob} />
              }
            />

            <Route
              path="/stations/:jobId"
              element={
                <StationWrapper jobs={jobs} onUpdateStep={handleUpdateStep} />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
