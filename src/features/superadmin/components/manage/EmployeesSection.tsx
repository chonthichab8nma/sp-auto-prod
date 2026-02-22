import { KeyRound, Loader2, Trash2 } from "lucide-react";
import type { EmployeeItem, EmployeeRole } from "../../services/superadmin.service";
import { roleLabel } from "../../constants/manage";
import { SectionWrapper } from "./ManageShared";

export function EmployeesSection({
  employees,
  updatingEmployeePasswordId,
  deletingEmployeeId,
  onOpenCreate,
  onOpenPassword,
  onDelete,
}: {
  employees: EmployeeItem[];
  updatingEmployeePasswordId: number | null;
  deletingEmployeeId: number | null;
  onOpenCreate: () => void;
  onOpenPassword: (item: EmployeeItem) => void;
  onDelete: (item: EmployeeItem) => void;
}) {
  return (
    <SectionWrapper
      title="จัดการพนักงาน"
      description=""
      headerAction={
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          เพิ่มพนักงาน
        </button>
      }
    >
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left font-medium">ชื่อ</th>
              <th className="px-3 py-2 text-left font-medium">สิทธิ์</th>
              <th className="px-3 py-2 text-left font-medium">เบอร์โทร</th>
              <th className="px-3 py-2 text-left font-medium">ชื่อผู้ใช้</th>
              <th className="px-3 py-2 text-right font-medium">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 bg-white">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {roleLabel[item.role as EmployeeRole] ?? item.role}
                  </span>
                </td>
                <td className="px-3 py-2">{item.phone}</td>
                <td className="px-3 py-2">{item.username}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPassword(item)}
                      disabled={updatingEmployeePasswordId === item.id}
                      className="inline-flex min-w-[110px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      แก้รหัสผ่าน
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      disabled={deletingEmployeeId === item.id}
                      className="inline-flex min-w-[64px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingEmployeeId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  ยังไม่มีข้อมูลพนักงาน
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
