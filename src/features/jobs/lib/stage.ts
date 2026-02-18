import type { JobApi, JobStageApi, JobStepApi } from "../api/job.api";

export function sortJobStages(stages: JobStageApi[]): JobStageApi[] {
  return stages.slice().sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
}

export function sortJobSteps(steps: JobStepApi[]): JobStepApi[] {
  return steps
    .slice()
    .sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);
}

const STAGE_RANK: Record<string, number> = {
  CLAIM: 0,
  REPAIR: 1,
  BILLING: 2,
};

const STATUS_RANK: Record<string, number> = {
  CLAIM: 0,
  REPAIR: 1,
  BILLING: 2,
  DONE: 3,
};

function norm(value?: string | null) {
  return (value ?? "").trim().toUpperCase();
}

export function isStageCompletedByProgress(
  stage: JobStageApi,
  jobStatus: string | null | undefined,
) {
  const stageCode = norm(stage.stage.code);
  const statusCode = norm(jobStatus);
  const stageRank = STAGE_RANK[stageCode];
  const statusRank = STATUS_RANK[statusCode];

  if (Number.isFinite(stageRank) && Number.isFinite(statusRank)) {
    if (statusRank >= 3) return true;
    if (stageRank < statusRank) return true;
  }

  return Boolean(stage.isCompleted);
}

export function buildJobTimelineStages(job: JobApi) {
  return sortJobStages(job.jobStages ?? []).map((stage) => ({
    id: String(stage.id),
    name: stage.stage.name,
    isCompleted: isStageCompletedByProgress(stage, job.status),
  }));
}
