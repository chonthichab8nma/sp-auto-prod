import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  VehicleBrandItem,
  VehicleModelItem,
  VehicleTypeItem,
} from "../../services/superadmin.service";
import type { GroupedCreateForm } from "../../constants/manage";
import { FormModal, SectionWrapper } from "./ManageShared";
import FormSelect from "../../../../shared/components/form/FormSelect";
import countries from '../../../../data/countries.json';
export function BrandsSection({
  brands,
  vehicleTypes,
  groupedCreateForm,
  creatingGrouped,
  editingBrandId,
  deletingBrandId,
  selectedModelsBrandId,
  modelsByBrand,
  loadingModelsByBrand,
  editingModelId,
  deletingModelId,
  deletingTypeId,
  onGroupedFormChange,
  onCreateGrouped,
  onClearGrouped,
  onSelectModelsBrand,
  onEdit,
  onDelete,
  onEditModel,
  onDeleteModel,
  onDeleteType,
}: {
  brands: VehicleBrandItem[];
  vehicleTypes: VehicleTypeItem[];
  groupedCreateForm: GroupedCreateForm;
  creatingGrouped: boolean;
  editingBrandId: number | null;
  deletingBrandId: number | null;
  selectedModelsBrandId: string;
  modelsByBrand: VehicleModelItem[];
  loadingModelsByBrand: boolean;
  editingModelId: number | null;
  deletingModelId: number | null;
  deletingTypeId: number | null;
  onGroupedFormChange: (next: GroupedCreateForm) => void;
  onCreateGrouped: (e: React.FormEvent) => Promise<boolean>;
  onClearGrouped: () => void;
  onSelectModelsBrand: (brandId: string) => void;
  onEdit: (item: VehicleBrandItem) => void;
  onDelete: (item: VehicleBrandItem) => void;
  onEditModel: (item: VehicleModelItem) => void;
  onDeleteModel: (item: VehicleModelItem) => void;
  onDeleteType: (item: VehicleTypeItem) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manageView, setManageView] = useState<"brand" | "model" | "type">("brand");

  const setForm = (patch: Partial<GroupedCreateForm>) => {
    onGroupedFormChange({ ...groupedCreateForm, ...patch });
  };

  const closeCreateModal = () => {
    if (creatingGrouped) return;
    onClearGrouped();
    setShowCreateModal(false);
  };

  const handleCreateGroupedSubmit = async (e: React.FormEvent) => {
    const success = await onCreateGrouped(e);
    if (!success) return;
    closeCreateModal();
  };

  const selectedBrandName =
    brands.find((item) => String(item.id) === selectedModelsBrandId)?.name ?? "-";

  return (
    <SectionWrapper
      title="จัดการยี่ห้อรถ"
      description=""
      headerAction={
        <div className="flex items-center gap-2">
          <div className="w-[180px]">
            <FormSelect
              value={manageView}
              options={[
                { value: "brand", label: "ยี่ห้อ" },
                { value: "model", label: "รุ่น" },
                { value: "type", label: "ประเภทรถ" },
              ]}
              onChange={(e) =>
                setManageView(e.target.value as "brand" | "model" | "type")
              }
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            เพิ่มข้อมูลรถ
          </button>
        </div>
      }
    >
      <div className="mt-5">
        {manageView === "brand" ? (
          <div>
            
            <div className="mt-3 overflow-x-auto">
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
                            aria-label={`แก้ไขยี่ห้อ ${item.name}`}
                            title="แก้ไข"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {editingBrandId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Pencil className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            disabled={deletingBrandId === item.id}
                            aria-label={`ลบยี่ห้อ ${item.name}`}
                            title="ลบ"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingBrandId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
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
        ) : manageView === "model" ? (
          <div>
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:w-[320px]">
                <FormSelect
                  value={selectedModelsBrandId}
                  options={brands.map((brand) => ({
                    value: String(brand.id),
                    label: brand.name,
                  }))}
                  placeholder="เลือกยี่ห้อเพื่อจัดการรุ่น"
                  onChange={(e) => onSelectModelsBrand(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              ยี่ห้อที่กำลังจัดการ: <span className="font-semibold">{selectedBrandName}</span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">ชื่อรุ่น</th>
                    <th className="px-3 py-2 text-left font-medium">ประเภท</th>
                    <th className="px-3 py-2 text-right font-medium">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingModelsByBrand ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                        กำลังโหลดรุ่นรถ...
                      </td>
                    </tr>
                  ) : null}

                  {!loadingModelsByBrand && modelsByBrand.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                        ยังไม่มีรุ่นรถในยี่ห้อนี้
                      </td>
                    </tr>
                  ) : null}

                  {!loadingModelsByBrand
                    ? modelsByBrand.map((item) => (
                        <tr key={item.id} className="border-t border-slate-200 bg-white">
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2">{item.type?.name || "-"}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => onEditModel(item)}
                                disabled={editingModelId === item.id}
                                aria-label={`แก้ไขรุ่น ${item.name}`}
                                title="แก้ไข"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {editingModelId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Pencil className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteModel(item)}
                                disabled={deletingModelId === item.id}
                                aria-label={`ลบรุ่น ${item.name}`}
                                title="ลบ"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingModelId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">รหัสประเภท</th>
                    <th className="px-3 py-2 text-left font-medium">ชื่อประเภท</th>
                    <th className="px-3 py-2 text-left font-medium">ชื่ออังกฤษ</th>
                    <th className="px-3 py-2 text-right font-medium">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleTypes.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200 bg-white">
                      <td className="px-3 py-2">{item.code}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">{item.nameEn || "-"}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onDeleteType(item)}
                            disabled={deletingTypeId === item.id}
                            aria-label={`ลบประเภท ${item.name}`}
                            title="ลบ"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingTypeId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vehicleTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                        ยังไม่มีข้อมูลประเภทรถ
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreateModal ? (
        <FormModal
          title="เพิ่มข้อมูลรถ"
          onClose={closeCreateModal}
          disableClose={creatingGrouped}
        >
          <form onSubmit={handleCreateGroupedSubmit} className="flex h-full flex-col gap-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  ขั้นตอนที่ 1
                </span>
                <div className="text-sm font-semibold text-slate-900">ข้อมูลยี่ห้อรถ</div>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ brandMode: "existing" })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    groupedCreateForm.brandMode === "existing"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  ใช้ยี่ห้อเดิม
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ brandMode: "new" })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    groupedCreateForm.brandMode === "new"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  เพิ่มยี่ห้อใหม่
                </button>
              </div>

              {groupedCreateForm.brandMode === "existing" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">เลือกยี่ห้อรถ</label>
                  <FormSelect
                    value={groupedCreateForm.existingBrandId}
                    options={brands.map((brand) => ({
                      value: String(brand.id),
                      label: brand.name,
                    }))}
                    placeholder="เลือกยี่ห้อรถ"
                    onChange={(e) => setForm({ existingBrandId: e.target.value })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รหัสยี่ห้อ</label>
                    <input
                      value={groupedCreateForm.brandCode}
                      onChange={(e) => setForm({ brandCode: e.target.value })}
                      placeholder="เช่น bmw"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่อยี่ห้อ</label>
                    <input
                      value={groupedCreateForm.brandName}
                      onChange={(e) => setForm({ brandName: e.target.value })}
                      placeholder="เช่น บีเอ็มดับเบิลยู (BMW)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่ออังกฤษ (ถ้ามี)</label>
                    <input
                      value={groupedCreateForm.brandNameEn}
                      onChange={(e) => setForm({ brandNameEn: e.target.value })}
                      placeholder="เช่น BMW"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ประเทศ (ถ้ามี)</label>
                    <FormSelect
                      value={groupedCreateForm.brandCountry}
                      options={countries.map((country) => ({
                        value: String(country.id),
                        label: country.th,
                      }))}
                      placeholder="เลือกประเทศ"
                      onChange={(e) => setForm({ brandCountry: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  ขั้นตอนที่ 2
                </span>
                <div className="text-sm font-semibold text-slate-900">รุ่นรถและประเภทรถ</div>
              </div>
              <div className="mb-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">รายการรุ่นรถ</label>
                <textarea
                  value={groupedCreateForm.modelNamesText}
                  onChange={(e) => setForm({ modelNamesText: e.target.value })}
                  placeholder={"กรอกหลายรายการ โดยคั่นด้วยบรรทัดใหม่ หรือเครื่องหมาย ,\nตัวอย่าง:\nCamry\nCorolla Cross\nHilux Revo"}
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                />
              </div>
              <div className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                หมายเหตุ: ระบบจะเพิ่มทุกรุ่นให้กับยี่ห้อเดียวกัน และใช้ประเภทรถเดียวกันตามที่เลือก
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ typeMode: "existing" })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    groupedCreateForm.typeMode === "existing"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  ใช้ประเภทเดิม
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ typeMode: "new" })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    groupedCreateForm.typeMode === "new"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  เพิ่มประเภทใหม่
                </button>
              </div>

              {groupedCreateForm.typeMode === "existing" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">เลือกประเภทรถ</label>
                  <FormSelect
                    value={groupedCreateForm.existingTypeId}
                    options={vehicleTypes.map((item) => ({
                      value: String(item.id),
                      label: item.name,
                    }))}
                    placeholder="เลือกประเภทรถ"
                    onChange={(e) => setForm({ existingTypeId: e.target.value })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รหัสประเภท</label>
                    <input
                      value={groupedCreateForm.typeCode}
                      onChange={(e) => setForm({ typeCode: e.target.value })}
                      placeholder="เช่น suv"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่อประเภท</label>
                    <input
                      value={groupedCreateForm.typeName}
                      onChange={(e) => setForm({ typeName: e.target.value })}
                      placeholder="เช่น รถอเนกประสงค์"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่ออังกฤษ (ถ้ามี)</label>
                    <input
                      value={groupedCreateForm.typeNameEn}
                      onChange={(e) => setForm({ typeNameEn: e.target.value })}
                      placeholder="เช่น Sport Utility Vehicle"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClearGrouped}
                disabled={creatingGrouped}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ล้างข้อมูล
              </button>
              <button
                type="submit"
                disabled={creatingGrouped}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingGrouped ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึก
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}
    </SectionWrapper>
  );
}
