import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../../Type";
import { filterData } from "../../features/jobs/hooks/useSearch";
import StationsFilters from "../components/StationsFilters";
import StationsTable from "../components/StationsTable";
import { INITIAL_STAGES } from "../../data";

export default function StationsPage({ jobs }: { jobs: Job[] }) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarType, setSelectedCarType] = useState("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState("ทั้งหมด");

  const allStatusOptions = useMemo(() => {
    return ["ทั้งหมด", ...INITIAL_STAGES.map((s) => s.name), "เสร็จสิ้น"];
  }, []);

  const filteredJobs = useMemo(() => {
    return filterData(
      jobs,
      searchTerm,
      selectedCarType,
      undefined,
      undefined,
      selectedStatus
    );
  }, [jobs, searchTerm, selectedCarType, selectedStatus]);

  const handleSearchAction = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  // return (
  //   <div className="bg-white min-h-screen p-6">
  //     <div className="mb-8">
  //       <h1 className="text-2xl font-bold text-slate-800 mb-1">สเตชั่น</h1>
  //       <p className="text-slate-500 text-sm">ระบุรายละเอียดการรับรถใหม่</p>
  //     </div>

  //     <StationsFilters
  //       searchTerm={searchTerm}
  //       selectedCarType={selectedCarType}
  //       selectedStatus={selectedStatus}
  //       statusOptions={allStatusOptions}
  //       onSearchTermChange={setSearchTerm}
  //       onCarTypeChange={setSelectedCarType}
  //       onStatusChange={setSelectedStatus}
  //       onSubmitSearch={handleSearchAction}
  //     />

  //     <StationsTable
  //       jobs={filteredJobs}
  //       onRowClick={(id) => {
  //         navigate(`//stations/${id}`);
  //       }}
  //     />
  //   </div>
  // );
  return "station"
}
