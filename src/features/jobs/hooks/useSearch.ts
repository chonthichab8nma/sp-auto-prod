import type { Job } from "../../../Type";

export const filterData = (
  data: Job[],
  searchTerm: string,
  selectedCarType: string = "ทั้งหมด",
  startDate?: string,
  endDate?: string,
  selectedStatus: string = "ทั้งหมด"
): Job[] => {
  if (!data || data.length === 0) return [];

  const queryNoSpace = searchTerm.toLowerCase().replace(/\s+/g, "");
  const queryNormal = searchTerm.toLowerCase().trim();

  return data.filter((item) => {
    const reg = (item.registration || "").toLowerCase().replace(/\s+/g, "");
    const name = (item.customerName || "").toLowerCase();
    // const brand = (item.brand || "").toLowerCase();
    // const model = (item.model || "").toLowerCase();
    // const bag = (item.bagNumber || "").toLowerCase();

    const matchesSearch =
      !searchTerm ||
      reg.includes(queryNoSpace) ||
      name.includes(queryNormal) ;
      // brand.includes(queryNormal) ||
      // model.includes(queryNormal) ||
      // bag.includes(queryNormal);

    const matchesType =
      selectedCarType === "ทั้งหมด" || item.type === selectedCarType;

    let currentStatusName = "รอดำเนินการ";
    if (item.isFinished) {
      currentStatusName = "เสร็จสิ้น";
    } else if (item.stages && item.stages[item.currentStageIndex]) {
      currentStatusName = item.stages[item.currentStageIndex].name.trim();
    }

    const matchesStatus =
      selectedStatus === "ทั้งหมด" || currentStatusName === selectedStatus;

    let matchesDate = true;
    if (startDate || endDate) {
      const jobStart = new Date(item.startDate).getTime();

      const jobEnd = item.estimatedEndDate
        ? new Date(item.estimatedEndDate).getTime()
        : jobStart;

      if (startDate) {
        const filterStart = new Date(startDate).setHours(0, 0, 0, 0);

        if (jobStart < filterStart) matchesDate = false;
      }

      if (endDate) {
        const filterEnd = new Date(endDate).setHours(23, 59, 59, 999);

        if (jobEnd > filterEnd) matchesDate = false;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });
};
