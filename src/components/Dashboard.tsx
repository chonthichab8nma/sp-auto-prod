import React from "react";
import {
  Car,
  ClipboardCheck,
  Wrench,
  FileText,
  CheckCircle2,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { type Job } from "../Type"; 

interface DashboardProps {
  jobs: Job[];
  onViewJob: (id: string) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} text-white p-4 rounded-xl shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs opacity-80 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard({ jobs, onViewJob }: DashboardProps) {
  const stats = {
    total: jobs.length,
    claim: jobs.filter((j) => j.currentStageIndex === 0).length,
    repair: jobs.filter((j) => j.currentStageIndex === 1).length,
    billing: jobs.filter((j) => j.currentStageIndex === 2 && !j.isFinished).length,
    finished: jobs.filter((j) => j.isFinished).length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <LayoutDashboard className="text-blue-600" /> แดชบอร์ดภาพรวม
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="รถทั้งหมด" value={stats.total} icon={<Car />} color="bg-slate-600" />
        <StatCard title="ขั้นตอนเคลม" value={stats.claim} icon={<ClipboardCheck />} color="bg-blue-500" />
        <StatCard title="ขั้นตอนซ่อม" value={stats.repair} icon={<Wrench />} color="bg-orange-500" />
        <StatCard title="ขั้นตอนตั้งเบิก" value={stats.billing} icon={<FileText />} color="bg-purple-500" />
        <StatCard title="เสร็จสิ้น" value={stats.finished} icon={<CheckCircle2 />} color="bg-green-500" />
      </div>

      {/* Job List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
          รายการรถในอู่ล่าสุด
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">ไม่มีรายการรถในระบบ</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                    ${
                      job.isFinished
                        ? "bg-green-500"
                        : job.currentStageIndex === 0
                        ? "bg-blue-500"
                        : job.currentStageIndex === 1
                        ? "bg-orange-500"
                        : "bg-purple-500"
                    }
                  `}
                  >
                    {job.registration.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-slate-800">
                      {job.registration}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        ({job.brand} {job.model})
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 flex gap-2">
                      <span>เลขถัง: {job.bagNumber}</span>
                      <span>•</span>
                      <span>{job.paymentType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          job.isFinished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >
                      {job.isFinished
                        ? "จบงานแล้ว"
                        : job.stages[job.currentStageIndex].name}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      รับรถ: {new Date(job.startDate).toLocaleDateString("th-TH")}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewJob(job.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <ArrowRight />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}