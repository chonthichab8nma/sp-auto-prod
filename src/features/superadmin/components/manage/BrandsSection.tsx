import { Loader2, Pencil, Trash2 } from "lucide-react";
import type {
  VehicleBrandItem,
  VehicleTypeItem,
} from "../../services/superadmin.service";
import type { GroupedCreateForm } from "../../constants/manage";
import { SectionWrapper } from "./ManageShared";

export function BrandsSection({
  brands,
  vehicleTypes,
  groupedCreateForm,
  creatingGrouped,
  editingBrandId,
  deletingBrandId,
  onGroupedFormChange,
  onCreateGrouped,
  onClearGrouped,
  onEdit,
  onDelete,
}: {
  brands: VehicleBrandItem[];
  vehicleTypes: VehicleTypeItem[];
  groupedCreateForm: GroupedCreateForm;
  creatingGrouped: boolean;
  editingBrandId: number | null;
  deletingBrandId: number | null;
  onGroupedFormChange: (next: GroupedCreateForm) => void;
  onCreateGrouped: (e: React.FormEvent) => void;
  onClearGrouped: () => void;
  onEdit: (item: VehicleBrandItem) => void;
  onDelete: (item: VehicleBrandItem) => void;
}) {
  const setForm = (patch: Partial<GroupedCreateForm>) => {
    onGroupedFormChange({ ...groupedCreateForm, ...patch });
  };

  return (
    <SectionWrapper title="จัดการยี่ห้อรถ" description="">
      <div className="mt-5 space-y-5">
        <form
          onSubmit={onCreateGrouped}
          className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4"
        >
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-900">
              เพิ่มข้อมูลรถแบบกลุ่ม (ยี่ห้อ, รุ่นรถ, ประเภทรถ)
            </h3>
            <p className="text-sm text-slate-600">
              เพิ่มได้ในครั้งเดียว เช่น ยี่ห้อ เต่า ไปยังรุ่น A1 และประเภท รถเก๋ง
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 text-sm font-semibold text-slate-800">ยี่ห้อรถ</div>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ brandMode: "existing" })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    groupedCreateForm.brandMode === "existing"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  ใช้ยี่ห้อเดิม
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ brandMode: "new" })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    groupedCreateForm.brandMode === "new"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  เพิ่มยี่ห้อใหม่
                </button>
              </div>

              {groupedCreateForm.brandMode === "existing" ? (
                <select
                  value={groupedCreateForm.existingBrandId}
                  onChange={(e) => setForm({ existingBrandId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="">เลือกยี่ห้อรถ</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={groupedCreateForm.brandCode}
                    onChange={(e) => setForm({ brandCode: e.target.value })}
                    placeholder="Code"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                  <input
                    value={groupedCreateForm.brandName}
                    onChange={(e) => setForm({ brandName: e.target.value })}
                    placeholder="ชื่อยี่ห้อ"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                  <input
                    value={groupedCreateForm.brandNameEn}
                    onChange={(e) => setForm({ brandNameEn: e.target.value })}
                    placeholder="Name EN (optional)"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                  <input
                    value={groupedCreateForm.brandCountry}
                    onChange={(e) => setForm({ brandCountry: e.target.value })}
                    placeholder="ประเทศ (optional)"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 text-sm font-semibold text-slate-800">รุ่นรถ + ประเภทรถ</div>
              <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  value={groupedCreateForm.modelName}
                  onChange={(e) => setForm({ modelName: e.target.value })}
                  placeholder="ชื่อรุ่น เช่น A1"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ typeMode: "existing" })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      groupedCreateForm.typeMode === "existing"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    ใช้ประเภทเดิม
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ typeMode: "new" })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      groupedCreateForm.typeMode === "new"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    เพิ่มประเภทใหม่
                  </button>
                </div>
              </div>

              {groupedCreateForm.typeMode === "existing" ? (
                <select
                  value={groupedCreateForm.existingTypeId}
                  onChange={(e) => setForm({ existingTypeId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="">เลือกประเภทรถ</option>
                  {vehicleTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <input
                    value={groupedCreateForm.typeCode}
                    onChange={(e) => setForm({ typeCode: e.target.value })}
                    placeholder="Type code"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                  <input
                    value={groupedCreateForm.typeName}
                    onChange={(e) => setForm({ typeName: e.target.value })}
                    placeholder="ชื่อประเภท"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                  <input
                    value={groupedCreateForm.typeNameEn}
                    onChange={(e) => setForm({ typeNameEn: e.target.value })}
                    placeholder="Name EN (optional)"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClearGrouped}
              disabled={creatingGrouped}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ล้างข้อมูล
            </button>
            <button
              type="submit"
              disabled={creatingGrouped}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingGrouped ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              เพิ่มข้อมูลแบบกลุ่ม
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-900">รายการยี่ห้อรถทั้งหมด</h3>
            <p className="text-sm text-slate-500">ใช้สำหรับแก้ไข/ลบข้อมูลยี่ห้อรถ</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">รหัส</th>
                  <th className="px-3 py-2 text-left font-medium">ชื่อยี่ห้อ</th>
                  <th className="px-3 py-2 text-left font-medium">ชื่ออังกฤษ</th>
                  <th className="px-3 py-2 text-left font-medium">ประเทศ</th>
                  <th className="px-3 py-2 text-right font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 bg-white">
                    <td className="px-3 py-2">{item.code}</td>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.nameEn || "-"}</td>
                    <td className="px-3 py-2">{item.country || "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          disabled={editingBrandId === item.id}
                          className="inline-flex min-w-[78px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {editingBrandId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Pencil className="h-3.5 w-3.5" />
                          )}
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          disabled={deletingBrandId === item.id}
                          className="inline-flex min-w-[64px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingBrandId === item.id ? (
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
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                      ยังไม่มีข้อมูลยี่ห้อรถ
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
