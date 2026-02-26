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
  const effectiveStatus = getEffectiveJobStatus(job);
  return sortJobStages(job.jobStages ?? []).map((stage) => ({
    id: String(stage.id),
    name: stage.stage.name,
    isCompleted: isStageCompletedByProgress(stage, effectiveStatus),
  }));
}

export function getEffectiveJobStatus(
  job: Pick<JobApi, "status" | "isFinished" | "jobStages">,
): JobApi["status"] {
  const rawStatus = norm(job.status);
  if (job.isFinished || rawStatus === "DONE") return "DONE";

  const stages = sortJobStages(job.jobStages ?? []);
  let progressedStageCode: string | null = null;

  for (const stage of stages) {
    const stageCode = norm(stage.stage.code);
    if (!(stageCode in STAGE_RANK)) continue;

    const steps = sortJobSteps(stage.jobSteps ?? []);
    const hasStepProgress = steps.some(
      (step) => step.status !== "pending" || Boolean(step.completedAt),
    );
    const hasStageProgress =
      Boolean(stage.startedAt) ||
      Boolean(stage.completedAt) ||
      Boolean(stage.isCompleted) ||
      hasStepProgress;

    if (hasStageProgress) progressedStageCode = stageCode;
  }

  if (
    progressedStageCode === "CLAIM" ||
    progressedStageCode === "REPAIR" ||
    progressedStageCode === "BILLING"
  ) {
    return progressedStageCode;
  }

  if (
    rawStatus === "CLAIM" ||
    rawStatus === "REPAIR" ||
    rawStatus === "BILLING" ||
    rawStatus === "DONE"
  ) {
    return rawStatus;
  }

  return "CLAIM";
}

export function getEffectiveStageIndex(
  job: Pick<JobApi, "status" | "isFinished" | "jobStages" | "currentStageIndex">,
): number {
  const stages = sortJobStages(job.jobStages ?? []);
  if (!stages.length) return 0;

  const effectiveStatus = getEffectiveJobStatus(job);
  if (effectiveStatus === "DONE") return stages.length - 1;

  const byStatus = stages.findIndex(
    (stage) => norm(stage.stage.code) === effectiveStatus,
  );
  if (byStatus >= 0) return byStatus;

  const raw = job.currentStageIndex ?? 0;
  if (!Number.isFinite(raw)) return 0;
  return Math.min(Math.max(raw, 0), stages.length - 1);
}
