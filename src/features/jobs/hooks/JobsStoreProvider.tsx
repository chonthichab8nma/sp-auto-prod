import { createContext, useEffect, useMemo, useState } from "react";
import { INITIAL_STAGES } from "../../../data";
import type { Job, JobFormData, StepStatus } from "../../../Type";
import { jobsRepoMock } from "../mock/jobs.repo.mock";

export type JobsStore = {
  jobs: Job[];
  createJob: (formData: JobFormData) => Job;
  updateJob: (updatedJob: Job) => void;
  updateStep: (
    jobId: string,
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employee: string
  ) => void;
};
// eslint-disable-next-line react-refresh/only-export-components
export const JobsStoreContext = createContext<JobsStore | null>(null);

export function JobsStoreProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => jobsRepoMock.getAll());

  useEffect(() => {
    jobsRepoMock.persist(jobs);
  }, [jobs]);

  const actions = useMemo(() => {
    const createJob = (formData: JobFormData) => {
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

      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    };

    const updateJob = (updatedJob: Job) => {
      setJobs((prev) =>
        prev.map((j) =>
          String(j.id) === String(updatedJob.id) ? updatedJob : j
        )
      );
    };

    const updateStep: JobsStore["updateStep"] = (
      jobId,
      stageIdx,
      stepId,
      status,
      employee
    ) => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (String(job.id) !== String(jobId)) return job;

          const newJob = { ...job, stages: [...job.stages] };

          const stage = { ...newJob.stages[stageIdx], steps: [...newJob.stages[stageIdx].steps] };
          newJob.stages[stageIdx] = stage;

          const stepIndex = stage.steps.findIndex((s) => s.id === stepId);
          if (stepIndex === -1) return newJob;

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
              newJob.stages[stageIdx + 1] = {
                ...newJob.stages[stageIdx + 1],
                isLocked: false,
              };
              newJob.currentStageIndex = stageIdx + 1;
            } else {
              newJob.isFinished = true;
            }
          }

          return newJob;
        })
      );
    };

    return { createJob, updateJob, updateStep };
  }, []);

  const value: JobsStore = { jobs, ...actions };

  return (
    <JobsStoreContext.Provider value={value}>
      {children}
    </JobsStoreContext.Provider>
  );
}
