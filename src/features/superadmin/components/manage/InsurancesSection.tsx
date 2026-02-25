import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { InsuranceCompanyItem } from "../../services/superadmin.service";
import { SectionWrapper } from "./ManageShared";

export function InsurancesSection({
  insurances,
  editingInsuranceId,
  deletingInsuranceId,
  onOpenCreate,
  onEdit,
  onDelete,
}: {
  insurances: InsuranceCompanyItem[];
  editingInsuranceId: number | null;
  deletingInsuranceId: number | null;
  onOpenCreate: () => void;
  onEdit: (item: InsuranceCompanyItem) => void;
  onDelete: (item: InsuranceCompanyItem) => void;
}) {
  return (
    <SectionWrapper
      title="จัดการบริษัทประกันภัย"
      description=""
      headerAction={
        <div className="flex h-10 items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            เพิ่มบริษัทประกันภัย
          </button>
        </div>
      }
    >
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left font-medium">ชื่อบริษัท</th>
              <th className="px-3 py-2 text-left font-medium">เบอร์ติดต่อ</th>
              <th className="px-3 py-2 text-left font-medium">สถานะ</th>
              <th className="px-3 py-2 text-right font-medium">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {insurances.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 bg-white">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.contactPhone || "-"}</td>
                <td className="px-3 py-2">{item.isActive ? <span className="text-green-600">เปิดใช้งาน</span> : <span className="text-red-600">ปิดใช้งาน</span>}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      disabled={editingInsuranceId === item.id}
                      aria-label={`แก้ไข ${item.name}`}
                      title="แก้ไข"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {editingInsuranceId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Pencil className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      disabled={deletingInsuranceId === item.id}
                      aria-label={`ลบ ${item.name}`}
                      title="ลบ"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingInsuranceId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {insurances.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                  ยังไม่มีข้อมูลบริษัทประกันภัย
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
