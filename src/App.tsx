import { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import JobDetail from "./components/JobDetail";
import Header from "./components/Header";
import CreateJobForm from "./components/CreateJobForm";

import { type Job, type JobFormData, INITIAL_STAGES, MOCK_JOBS } from "./Type";

function JobDetailWrapper({
  jobs,
  onUpdate,
}: {
  jobs: Job[];
  onUpdate: (j: Job) => void;
}) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem("job_form", JSON.stringify(jobs));
  }, [jobs]);

  const job = jobs.find((j) => j.id === jobId);

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

function App() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const savedJobs = localStorage.getItem("job_form");
    return savedJobs ? JSON.parse(savedJobs) : MOCK_JOBS;
  });

  const navigate = useNavigate();

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

  return (
    <>
      <Header
        jobs={jobs}
        onJobSelect={(id) => navigate(`/job/${id}`)}
        onGoHome={() => navigate("/")}
        onNewJob={() => navigate("/create")}
      />
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto mt-6">
          <Routes>
            <Route path="/" element={<Dashboard jobs={jobs} />} />

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
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
