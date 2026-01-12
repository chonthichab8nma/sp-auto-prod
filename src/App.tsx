// App.tsx
import React, { useState } from "react";
import { Wrench, Search, Plus } from "lucide-react";
import  { type Job, type JobFormData, MOCK_JOBS, INITIAL_STAGES } from "./Type";

// Import Components ที่เราแยกไว้
import Dashboard from "./components/Dashboard";
import CreateJobForm from "./components/CreateJobForm";
import JobDetail from "./components/JobDetail";

export default function GarageSystem() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [activeView, setActiveView] = useState<"dashboard" | "create" | "detail">("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = jobs.find(
      (j) => j.registration.includes(searchQuery) || j.bagNumber.includes(searchQuery)
    );
    if (found) {
      setSelectedJobId(found.id);
      setActiveView("detail");
    } else {
      alert("ไม่พบข้อมูลรถทะเบียนนี้");
    }
  };

  const createNewJob = (formData: JobFormData) => {
    const newJob: Job = {
      id: Date.now().toString(),
      ...formData,
      currentStageIndex: 0,
      isFinished: false,
      stages: JSON.parse(JSON.stringify(INITIAL_STAGES)),
    };
    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    setActiveView("detail");
  };

  const updateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView("dashboard")}>
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Wrench size={20} />
            </div>
            <h1 className="text-xl font-bold text-blue-900 hidden md:block">Garage Pro</h1>
          </div>

          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="ค้นหา ทะเบียนรถ / เลขถัง..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </form>
          </div>

          <button onClick={() => setActiveView("create")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <Plus size={16} />
            <span className="hidden sm:inline">รับรถใหม่</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeView === "dashboard" && (
          <Dashboard
            jobs={jobs}
            onViewJob={(id) => {
              setSelectedJobId(id);
              setActiveView("detail");
            }}
          />
        )}
        {activeView === "create" && (
          <CreateJobForm
            onCancel={() => setActiveView("dashboard")}
            onSubmit={createNewJob}
          />
        )}
        {activeView === "detail" && activeJob && (
          <JobDetail
            job={activeJob}
            onUpdate={updateJob}
            onBack={() => setActiveView("dashboard")}
          />
        )}
      </main>
    </div>
  );
}