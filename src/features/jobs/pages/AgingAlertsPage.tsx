import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  AlertOctagon,
  Bell,
  RefreshCw,
  Settings,
  X,
  RotateCcw,
} from "lucide-react";
import { useAgingAlerts } from "../hooks/useAgingAlerts";
import { formatThaiDate } from "../../../shared/lib/date";
import Skeleton from "../../../shared/components/ui/Skeleton";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import type { JobApi } from "../api/job.api";
import {
  getAlertConfigs,
  upsertAlertConfig,
  resetAlertConfigs,
} from "../api/disbursement.api";

type ThresholdFilter = "all" | "warning" | "critical";
type StatusFilter = "" | "CLAIM" | "REPAIR" | "BILLING";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "ทุกสถานะ" },
  { value: "CLAIM", label: "เคลม" },
  { value: "REPAIR", label: "ซ่อม" },
  { value: "BILLING", label: "ตั้งเบิก" },
];

export default function AgingAlertsPage() {
  const [threshold, setThreshold] = useState<ThresholdFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const { data, loading, error, refetch } = useAgingAlerts(
    threshold,
    statusFilter || undefined,
  );
  const navigate = useNavigate();

  // Alert config state
  const [showConfig, setShowConfig] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [editValues, setEditValues] = useState<
    Record<string, { warningDays: string; criticalDays: string }>
  >({});
  const [configError, setConfigError] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");

  const fetchConfigs = async () => {
    setConfigLoading(true);
    setConfigError("");
    try {
      const res = await getAlertConfigs();
      const vals: typeof editValues = {};
      for (const c of res) {
        vals[c.status] = {
          warningDays: String(c.warningDays),
          criticalDays: String(c.criticalDays),
        };
      }
      setEditValues(vals);
    } catch {
      setConfigError("โหลดการตั้งค่าไม่สำเร็จ");
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (showConfig) fetchConfigs();
  }, [showConfig]);

  const handleSaveConfig = async (status: string) => {
    const v = editValues[status];
    if (!v) return;
    const w = Number(v.warningDays);
    const c = Number(v.criticalDays);
    if (isNaN(w) || isNaN(c) || w <= 0 || c <= 0) {
      setConfigError("ค่าต้องเป็นจำนวนเต็มบวก");
      return;
    }
    if (w >= c) {
      setConfigError("วันเตือนต้องน้อยกว่าวันวิกฤต");
      return;
    }
    setConfigError("");
    try {
      await upsertAlertConfig(status, { warningDays: w, criticalDays: c });
      setConfigSuccess(`บันทึก ${status} สำเร็จ`);
      setTimeout(() => setConfigSuccess(""), 2000);
      fetchConfigs();
      refetch();
    } catch (e: any) {
      setConfigError(e?.response?.data?.error || "บันทึกไม่สำเร็จ");
    }
  };

  const handleReset = async () => {
    try {
      await resetAlertConfigs();
      setConfigSuccess("รีเซ็ตสำเร็จ");
      setTimeout(() => setConfigSuccess(""), 2000);
      fetchConfigs();
      refetch();
    } catch {
      setConfigError("รีเซ็ตไม่สำเร็จ");
    }
  };

  const tabs: { key: ThresholdFilter; label: string; icon: React.ReactNode }[] =
    [
      { key: "all", label: "ทั้งหมด", icon: <Bell size={14} /> },
      {
        key: "warning",
        label: "เตือน",
        icon: <AlertTriangle size={14} />,
      },
      {
        key: "critical",
        label: "วิกฤต",
        icon: <AlertOctagon size={14} />,
      },
    ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            แจ้งเตือนงานล่าช้า
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            คำนวณจากเวลาในสถานะปัจจุบัน (ตั้งค่าได้ต่อสถานะ)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            title="ตั้งค่าเกณฑ์"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50"
            title="รีเฟรช"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {data.summary.totalAlerts}
            </div>
            <div className="text-xs text-slate-500 mt-1">แจ้งเตือนทั้งหมด</div>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5 shadow-sm">
            <div className="text-2xl font-bold text-yellow-700">
              {data.summary.warningCount}
            </div>
            <div className="text-xs text-yellow-600 mt-1">เตือน</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm">
            <div className="text-2xl font-bold text-red-700">
              {data.summary.criticalCount}
            </div>
            <div className="text-xs text-red-600 mt-1">วิกฤต</div>
          </div>
        </div>
      )}

      {/* Filter tabs + status dropdown */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setThreshold(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              threshold === t.key
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}

        <div className="ml-auto">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading && !data ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Bell size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">ไม่มีแจ้งเตือน</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    เลขงาน
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    ทะเบียนรถ
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    ลูกค้า
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    บริษัทประกัน
                  </th>
                  <th className="text-center px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    สถานะ
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    วันที่เข้า
                  </th>
                  <th className="text-center px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    จำนวนวัน
                  </th>
                  <th className="text-center px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    ระดับ
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((alert) => {
                  const isCritical = alert.agingStatus === "critical";
                  return (
                    <tr
                      key={alert.id}
                      onClick={() => navigate(`/job/${alert.id}`)}
                      className={`cursor-pointer border-b transition-colors ${
                        isCritical
                          ? "bg-red-100 border-red-200 hover:bg-red-200"
                          : "bg-amber-100 border-amber-200 hover:bg-amber-200"
                      }`}
                    >
                      <td
                        className={`px-5 py-3.5 font-semibold ${isCritical ? "text-red-900" : "text-amber-900"}`}
                      >
                        {alert.jobNumber}
                      </td>
                      <td
                        className={`px-5 py-3.5 font-medium ${isCritical ? "text-red-800" : "text-amber-800"}`}
                      >
                        {alert.vehicle.registration}
                      </td>
                      <td
                        className={`px-5 py-3.5 ${isCritical ? "text-red-700" : "text-amber-700"}`}
                      >
                        {alert.customer.name}
                      </td>
                      <td
                        className={`px-5 py-3.5 ${isCritical ? "text-red-700" : "text-amber-700"}`}
                      >
                        {alert.insuranceCompany?.name ?? "-"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <StatusBadge
                          job={
                            { status: alert.status, isFinished: false } as JobApi
                          }
                        />
                      </td>
                      <td
                        className={`px-5 py-3.5 whitespace-nowrap ${isCritical ? "text-red-700" : "text-amber-700"}`}
                      >
                        {formatThaiDate(alert.startDate)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`text-lg font-bold ${isCritical ? "text-red-800" : "text-amber-800"}`}
                        >
                          {alert.daysInProcess}
                        </span>
                        <span
                          className={`text-xs ml-0.5 ${isCritical ? "text-red-500" : "text-amber-500"}`}
                        >
                          วัน
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                            <AlertOctagon size={12} />
                            วิกฤต
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                            <AlertTriangle size={12} />
                            เตือน
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfig(false)}
            aria-label="close"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">
                  ตั้งค่าเกณฑ์แจ้งเตือน
                </h3>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {configError && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
                  {configError}
                </div>
              )}
              {configSuccess && (
                <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-xs">
                  {configSuccess}
                </div>
              )}

              {configLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {["CLAIM", "REPAIR", "BILLING"].map((status) => {
                    const v = editValues[status] || {
                      warningDays: "",
                      criticalDays: "",
                    };
                    const label =
                      status === "CLAIM"
                        ? "เคลม"
                        : status === "REPAIR"
                          ? "ซ่อม"
                          : "ตั้งเบิก";
                    return (
                      <div
                        key={status}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <div className="w-16 text-xs font-semibold text-slate-700">
                          {label}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-yellow-600 font-medium">
                              เตือน (วัน)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={v.warningDays}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  [status]: {
                                    ...prev[status],
                                    warningDays: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-red-600 font-medium">
                              วิกฤต (วัน)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={v.criticalDays}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  [status]: {
                                    ...prev[status],
                                    criticalDays: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveConfig(status)}
                            className="mt-3 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            บันทึก
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={12} />
                  รีเซ็ตค่าเริ่มต้น
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
