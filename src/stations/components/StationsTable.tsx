import JobsTable from "../../features/jobs/components/JobsTable";
import type { JobApi } from "../../features/jobs/api/job.api";

export type StationType = "CLAIM" | "REPAIR" | "BILLING";
export type StationFilter = StationType | "ALL";

export default function StationsTable({
  station = "ALL",
  jobs = [],
  onRowClick,
}: {
  station?: StationFilter;
  jobs?: JobApi[];
  onRowClick: (id: number) => void;
}) {
  const filteredJobs =
    station === "ALL" ? jobs : jobs.filter((job) => job.status === station);

  return <JobsTable jobs={filteredJobs} onRowClick={onRowClick} />;
}
