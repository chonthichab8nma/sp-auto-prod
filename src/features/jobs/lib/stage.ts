import type { JobApi, JobStageApi, JobStepApi } from "../api/job.api";

export function sortJobStages(stages: JobStageApi[]): JobStageApi[] {
  return stages.slice().sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
}

export function sortJobSteps(steps: JobStepApi[]): JobStepApi[] {
  return steps
    .slice()
    .sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);
}

export function buildJobTimelineStages(job: JobApi) {
  return sortJobStages(job.jobStages ?? []).map((stage) => ({
    id: String(stage.id),
    name: stage.stage.name,
    isCompleted: stage.isCompleted,
  }));
}
