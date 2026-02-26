import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import FormSelect from "../../../shared/components/form/FormSelect";
import Skeleton from "../../../shared/components/ui/Skeleton";
import {
  defaultGroupedCreateForm,
  type ManageTab,
} from "../constants/manage";
import { AlertConfigsSection } from "../components/manage/AlertConfigsSection";
import { BrandsSection } from "../components/manage/BrandsSection";
import { EmployeesSection } from "../components/manage/EmployeesSection";
import { InsurancesSection } from "../components/manage/InsurancesSection";
import {
  ConfirmModal,
  EmployeeSectionSkeleton,
  FormModal,
  TextInput,
} from "../components/manage/ManageShared";
import { useSuperAdminManage } from "../hooks/useSuperAdminManage";
import type { EmployeeRole } from "../services/superadmin.service";

const alertStatusLabel: Record<string, string> = {
  CLAIM: "เคลม",
  REPAIR: "ซ่อม",
  BILLING: "วางบิล",
  DONE: "งานเสร็จ",
};

function ManageTableSkeleton({
  title,
  columns,
}: {
  title: string;
  columns: number;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <div className="grid min-w-[720px] gap-3 bg-slate-50 px-3 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton key={`head-${title}-${idx}`} className="h-4 w-20" />
          ))}
        </div>
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={`row-${title}-${row}`}
              className="grid min-w-[720px] gap-3 border-t border-slate-200 px-3 py-3"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((__, col) => (
                <Skeleton key={`cell-${title}-${row}-${col}`} className="h-5 w-full max-w-[140px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SuperAdminManagePage() {
  const [searchParams] = useSearchParams();
  const vm = useSuperAdminManage();

  const activeTabParam = searchParams.get("tab");
  const activeTab: ManageTab =
    activeTabParam === "insurances" ||
    activeTabParam === "brands" ||
    activeTabParam === "alerts"
      ? activeTabParam
      : "employees";

  return (
    <div className="flex w-full flex-col gap-5">

      {vm.loading && activeTab === "employees" ? <EmployeeSectionSkeleton /> : null}
      {vm.loading && activeTab === "insurances" ? (
        <ManageTableSkeleton title="insurances" columns={4} />
      ) : null}
      {vm.loading && activeTab === "brands" ? (
        <ManageTableSkeleton title="brands" columns={5} />
      ) : null}
      {vm.loading && activeTab === "alerts" ? (
        <ManageTableSkeleton title="alerts" columns={5} />
      ) : null}

      {!vm.loading && activeTab === "employees" ? (
        <EmployeesSection
          employees={vm.employees}
          deletingEmployeeId={vm.deletingEmployeeId}
          onOpenCreate={vm.openEmployeeCreateModal}
          onEdit={vm.openEmployeeEditModal}
          onDelete={(item) =>
            vm.openDeleteModal({ type: "employee", id: item.id, name: item.name })
          }
        />
      ) : null}

      {!vm.loading && activeTab === "insurances" ? (
        <InsurancesSection
          insurances={vm.insurances}
          editingInsuranceId={vm.editingInsuranceId}
          deletingInsuranceId={vm.deletingInsuranceId}
          onOpenCreate={() => vm.setShowInsuranceForm(true)}
          onEdit={vm.openInsuranceEditModal}
          onDelete={(item) =>
            vm.openDeleteModal({ type: "insurance", id: item.id, name: item.name })
          }
        />
      ) : null}

      {!vm.loading && activeTab === "brands" ? (
        <BrandsSection
          brands={vm.brands}
          vehicleTypes={vm.vehicleTypes}
          groupedCreateForm={vm.groupedCreateForm}
          creatingGrouped={vm.creatingGrouped}
          editingBrandId={vm.editingBrandId}
          deletingBrandId={vm.deletingBrandId}
          selectedModelsBrandId={vm.selectedModelsBrandId}
          modelsByBrand={vm.modelsByBrand}
          loadingModelsByBrand={vm.loadingModelsByBrand}
          editingModelId={vm.editingModelId}
          deletingModelId={vm.deletingModelId}
          deletingTypeId={vm.deletingTypeId}
          onGroupedFormChange={vm.setGroupedCreateForm}
          onCreateGrouped={vm.handleCreateGroupedVehicle}
          onClearGrouped={() => vm.setGroupedCreateForm(defaultGroupedCreateForm)}
          onSelectModelsBrand={vm.setSelectedModelsBrandId}
          onEdit={vm.openBrandEditModal}
          onDelete={(item) => vm.openDeleteModal({ type: "brand", id: item.id, name: item.name })}
          onEditModel={vm.openModelEditModal}
          onDeleteModel={(item) =>
            vm.openDeleteModal({
              type: "model",
              id: item.id,
              name: item.name,
              brandId: item.brandId ?? Number(vm.selectedModelsBrandId),
            })
          }
          onDeleteType={(item) =>
            vm.openDeleteModal({ type: "type", id: item.id, name: item.name })
          }
        />
      ) : null}

      {!vm.loading && activeTab === "alerts" ? (
        <AlertConfigsSection
          configs={vm.alertConfigs}
          editingAlertConfigId={vm.editingAlertConfigId}
          onEdit={vm.openAlertConfigEditModal}
        />
      ) : null}

      {vm.showEmployeeForm ? (
        <FormModal
          title="เพิ่มข้อมูลพนักงาน"
          onClose={vm.closeEmployeeForm}
          disableClose={vm.creatingEmployee}
        >
          <form
            onSubmit={vm.handleCreateEmployee}
            autoComplete="off"
            className="flex h-full flex-col gap-4"
          >
            <TextInput
              label="ชื่อ - นามสกุล"
              value={vm.employeeForm.name}
              onChange={(next) => vm.setEmployeeForm((prev) => ({ ...prev, name: next }))}
              placeholder="กรอกชื่อ - นามสกุล"
              autoComplete="off"
              name="employee_name"
            />
            <FormSelect
              label="สิทธิ์การใช้งาน"
              value={vm.employeeForm.role}
              options={["staff", "admin"]}
              onChange={(e) =>
                vm.setEmployeeForm((prev) => ({ ...prev, role: e.target.value as EmployeeRole }))
              }
            />
            <TextInput
              label="เบอร์โทรศัพท์"
              value={vm.employeeForm.phone}
              onChange={(next) =>
                vm.setEmployeeForm((prev) => {
                  const digits = next.replace(/\D/g, "").slice(0, 10);
                  if (digits.length > 0 && digits[0] !== "0") return prev;
                  return { ...prev, phone: digits };
                })
              }
              placeholder="กรอกเบอร์โทรศัพท์"
              autoComplete="tel"
              name="employee_phone"
            />
            <TextInput
              label="ชื่อผู้ใช้งาน"
              value={vm.employeeForm.username}
              onChange={(next) => vm.setEmployeeForm((prev) => ({ ...prev, username: next }))}
              placeholder="กรอกชื่อผู้ใช้งาน"
              autoComplete="off"
              name="employee_username"
            />
            <TextInput
              label="รหัสผ่าน"
              value={vm.employeeForm.password}
              onChange={(next) => vm.setEmployeeForm((prev) => ({ ...prev, password: next }))}
              placeholder="กรอกรหัสผ่าน"
              type="password"
              autoComplete="new-password"
              name="employee_password"
            />

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeEmployeeForm}
                disabled={vm.creatingEmployee}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={vm.creatingEmployee}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.creatingEmployee ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกพนักงาน
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.employeeEditTarget ? (
        <FormModal
          title="ปรับปรุงข้อมูลพนักงาน"
          onClose={vm.closeEmployeeEditModal}
          disableClose={Boolean(vm.editingEmployeeId)}
        >
          <form onSubmit={vm.handleUpdateEmployee} className="flex h-full flex-col gap-4">
            <TextInput
              label="ชื่อ - นามสกุล"
              value={vm.employeeEditForm.name}
              onChange={(next) => vm.setEmployeeEditForm((prev) => ({ ...prev, name: next }))}
              placeholder="กรอกชื่อ - นามสกุล"
            />
            <FormSelect
              label="สิทธิ์การใช้งาน"
              value={vm.employeeEditForm.role}
              options={["staff", "admin"]}
              onChange={(e) =>
                vm.setEmployeeEditForm((prev) => ({
                  ...prev,
                  role: e.target.value as EmployeeRole,
                }))
              }
            />
            <TextInput
              label="เบอร์โทร"
              value={vm.employeeEditForm.phone}
              onChange={(next) =>
                vm.setEmployeeEditForm((prev) => {
                  const digits = next.replace(/\D/g, "").slice(0, 10);
                  if (digits.length > 0 && digits[0] !== "0") return prev;
                  return { ...prev, phone: digits };
                })
              }
              placeholder="กรอกเบอร์โทร"
            />
            <TextInput
              label="ชื่อผู้ใช้งาน"
              value={vm.employeeEditForm.username}
              onChange={(next) =>
                vm.setEmployeeEditForm((prev) => ({ ...prev, username: next }))
              }
              placeholder="กรอกชื่อผู้ใช้งาน"
            />
            <TextInput
              label="รหัสผ่านใหม่ (ไม่บังคับ)"
              value={vm.employeeEditForm.password ?? ""}
              onChange={(next) =>
                vm.setEmployeeEditForm((prev) => ({ ...prev, password: next }))
              }
              placeholder="เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
              type="password"
            />

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeEmployeeEditModal}
                disabled={Boolean(vm.editingEmployeeId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(vm.editingEmployeeId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.editingEmployeeId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.showInsuranceForm ? (
        <FormModal
          title="จัดการบริษัทประกันภัย"
          onClose={vm.closeInsuranceForm}
          disableClose={vm.creatingInsurance}
        >
          <form onSubmit={vm.handleCreateInsurance} className="flex h-full flex-col gap-4">
            <TextInput
              label="ชื่อบริษัท"
              value={vm.insuranceForm.name}
              onChange={(next) => vm.setInsuranceForm((prev) => ({ ...prev, name: next }))}
              placeholder="กรอกชื่อบริษัท"
            />
            <TextInput
              label="เบอร์ติดต่อ"
              value={vm.insuranceForm.contactPhone}
              onChange={(next) =>
                vm.setInsuranceForm((prev) => ({
                  ...prev,
                  contactPhone: next.replace(/\D/g, ""),
                }))
              }
              placeholder="กรอกเบอร์ติดต่อ"
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                id="insurance-active"
                type="checkbox"
                checked={vm.insuranceForm.isActive}
                onChange={(e) =>
                  vm.setInsuranceForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="insurance-active" className="text-sm text-slate-700">
                เปิดใช้งาน
              </label>
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeInsuranceForm}
                disabled={vm.creatingInsurance}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={vm.creatingInsurance}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.creatingInsurance ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกบริษัทประกันภัย
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.employeePasswordTarget ? (
        <FormModal
          title="แก้ไขรหัสผ่านพนักงาน"
          onClose={vm.closeEmployeePasswordModal}
          disableClose={Boolean(vm.updatingEmployeePasswordId)}
        >
          <form onSubmit={vm.handleUpdateEmployeePassword} className="flex h-full flex-col gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              พนักงาน: {vm.employeePasswordTarget.name}
            </div>
            <TextInput
              label="รหัสผ่านใหม่"
              value={vm.employeePassword}
              onChange={vm.setEmployeePassword}
              placeholder="กรอกรหัสผ่านใหม่"
              type="password"
            />
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeEmployeePasswordModal}
                disabled={Boolean(vm.updatingEmployeePasswordId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(vm.updatingEmployeePasswordId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.updatingEmployeePasswordId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกรหัสผ่าน
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.alertConfigEditTarget ? (
        <FormModal
          title={`แก้ไขระยะเวลาแจ้งเตือน : ${
            alertStatusLabel[vm.alertConfigEditTarget.status] ?? vm.alertConfigEditTarget.status
          }`}
          onClose={vm.closeAlertConfigEditModal}
          disableClose={Boolean(vm.editingAlertConfigId)}
        >
          <form onSubmit={vm.handleUpdateAlertConfig} className="flex h-full flex-col gap-4">
            <div className=" px-3 py-2 text-xs text-red-700">
              หมายเหตุ: จำนวนวันเกินกำหนดต้องมากกว่าหรือเท่ากับจำนวนวันแจ้งเตือน
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800">เริ่มแจ้งเตือน (วัน)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={String(vm.alertConfigEditForm.warningDays)}
                  onChange={(e) =>
                    vm.setAlertConfigEditForm((prev) => ({
                      ...prev,
                      warningDays: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800">เกินกำหนด (วัน)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={String(vm.alertConfigEditForm.criticalDays)}
                  onChange={(e) =>
                    vm.setAlertConfigEditForm((prev) => ({
                      ...prev,
                      criticalDays: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeAlertConfigEditModal}
                disabled={Boolean(vm.editingAlertConfigId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(vm.editingAlertConfigId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.editingAlertConfigId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.insuranceEditTarget ? (
        <FormModal
          title="แก้ไขบริษัทประกันภัย"
          onClose={vm.closeInsuranceEditModal}
          disableClose={Boolean(vm.editingInsuranceId)}
        >
          <form onSubmit={vm.handleUpdateInsurance} className="flex h-full flex-col gap-4">
            <TextInput
              label="ชื่อบริษัท"
              value={vm.insuranceEditForm.name}
              onChange={(next) => vm.setInsuranceEditForm((prev) => ({ ...prev, name: next }))}
              placeholder="กรอกชื่อบริษัท"
            />
            <TextInput
              label="เบอร์ติดต่อ"
              value={vm.insuranceEditForm.contactPhone}
              onChange={(next) =>
                vm.setInsuranceEditForm((prev) => ({
                  ...prev,
                  contactPhone: next.replace(/\D/g, ""),
                }))
              }
              placeholder="กรอกเบอร์ติดต่อ"
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                id="insurance-edit-active"
                type="checkbox"
                checked={vm.insuranceEditForm.isActive}
                onChange={(e) =>
                  vm.setInsuranceEditForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="insurance-edit-active" className="text-sm text-slate-700">
                เปิดใช้งาน
              </label>
            </div>
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeInsuranceEditModal}
                disabled={Boolean(vm.editingInsuranceId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(vm.editingInsuranceId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.editingInsuranceId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.brandEditTarget ? (
        <FormModal
          title="แก้ไขยี่ห้อรถ"
          onClose={vm.closeBrandEditModal}
          disableClose={Boolean(vm.editingBrandId)}
        >
          <form onSubmit={vm.handleUpdateBrand} className="flex h-full flex-col gap-4">
            <TextInput
              label="Code"
              value={vm.brandEditForm.code}
              onChange={(next) => vm.setBrandEditForm((prev) => ({ ...prev, code: next }))}
              placeholder="toyota"
            />
            <TextInput
              label="ชื่อ"
              value={vm.brandEditForm.name}
              onChange={(next) => vm.setBrandEditForm((prev) => ({ ...prev, name: next }))}
              placeholder="โตโยต้า"
            />
            <TextInput
              label="Name EN"
              value={vm.brandEditForm.nameEn}
              onChange={(next) => vm.setBrandEditForm((prev) => ({ ...prev, nameEn: next }))}
              placeholder="Toyota"
            />
            <TextInput
              label="ประเทศ"
              value={vm.brandEditForm.country}
              onChange={(next) => vm.setBrandEditForm((prev) => ({ ...prev, country: next }))}
              placeholder="ญี่ปุ่น"
            />
            <TextInput
              label="Logo URL"
              value={vm.brandEditForm.logoUrl}
              onChange={(next) => vm.setBrandEditForm((prev) => ({ ...prev, logoUrl: next }))}
              placeholder="https://..."
            />
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeBrandEditModal}
                disabled={Boolean(vm.editingBrandId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(vm.editingBrandId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.editingBrandId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.modelEditTarget ? (
        <FormModal
          title="แก้ไขรุ่นรถ + ประเภทรถ"
          onClose={vm.closeModelEditModal}
          disableClose={Boolean(vm.editingModelId)}
        >
          <form onSubmit={vm.handleUpdateVehicleModel} className="flex h-full flex-col gap-4">
            <TextInput
              label="ชื่อรุ่น"
              value={vm.modelEditForm.name}
              onChange={(next) => vm.setModelEditForm((prev) => ({ ...prev, name: next }))}
              placeholder="เช่น Camry"
            />
            <FormSelect
              label="ประเภทรถ"
              value={vm.modelEditForm.typeId}
              options={vm.vehicleTypes.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
              placeholder="เลือกประเภทรถ"
              onChange={(e) =>
                vm.setModelEditForm((prev) => ({ ...prev, typeId: e.target.value }))
              }
            />
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={vm.closeModelEditModal}
                disabled={Boolean(vm.editingModelId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(vm.editingModelId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vm.editingModelId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {vm.deleteTarget ? (
        <ConfirmModal
          title="ยืนยันการลบข้อมูล"
          message={`ยืนยันลบ ${vm.deleteTarget.name} ใช่หรือไม่?`}
          confirmLabel="ยืนยันลบ"
          danger
          loading={vm.deletingWithModal}
          onClose={() => {
            if (vm.deletingWithModal) return;
            vm.setDeleteTarget(null);
          }}
          onConfirm={vm.handleConfirmDelete}
        />
      ) : null}
    </div>
  );
}
