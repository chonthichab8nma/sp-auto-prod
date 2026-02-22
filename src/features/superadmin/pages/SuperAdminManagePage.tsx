import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FormSelect from "../../../shared/components/form/FormSelect";
import {
  defaultGroupedCreateForm,
  tabItems,
  type ManageTab,
} from "../constants/manage";
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

export default function SuperAdminManagePage() {
  const [searchParams] = useSearchParams();
  const vm = useSuperAdminManage();

  const activeTabParam = searchParams.get("tab");
  const activeTab: ManageTab =
    activeTabParam === "insurances" || activeTabParam === "brands"
      ? activeTabParam
      : "employees";

  const activeLabel = useMemo(
    () => tabItems.find((tab) => tab.id === activeTab)?.label ?? "",
    [activeTab],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">จัดการข้อมูลระบบ</h1>
      </section>

      {vm.loading && activeTab === "employees" ? <EmployeeSectionSkeleton /> : null}

      {vm.loading && activeTab !== "employees" ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดข้อมูล {activeLabel}
          </span>
        </div>
      ) : null}

      {!vm.loading && activeTab === "employees" ? (
        <EmployeesSection
          employees={vm.employees}
          updatingEmployeePasswordId={vm.updatingEmployeePasswordId}
          deletingEmployeeId={vm.deletingEmployeeId}
          onOpenCreate={() => vm.setShowEmployeeForm(true)}
          onOpenPassword={(item) => {
            vm.setEmployeePasswordTarget(item);
            vm.setEmployeePassword("");
          }}
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
          onGroupedFormChange={vm.setGroupedCreateForm}
          onCreateGrouped={vm.handleCreateGroupedVehicle}
          onClearGrouped={() => vm.setGroupedCreateForm(defaultGroupedCreateForm)}
          onEdit={vm.openBrandEditModal}
          onDelete={(item) => vm.openDeleteModal({ type: "brand", id: item.id, name: item.name })}
        />
      ) : null}

      {vm.showEmployeeForm ? (
        <FormModal
          title="จัดการพนักงาน"
          onClose={vm.closeEmployeeForm}
          disableClose={vm.creatingEmployee}
        >
          <form onSubmit={vm.handleCreateEmployee} className="flex h-full flex-col gap-4">
            <TextInput
              label="ชื่อ"
              value={vm.employeeForm.name}
              onChange={(next) => vm.setEmployeeForm((prev) => ({ ...prev, name: next }))}
              placeholder="Jane Doe"
            />
            <FormSelect
              label="Role"
              value={vm.employeeForm.role}
              options={["staff", "admin"]}
              onChange={(e) =>
                vm.setEmployeeForm((prev) => ({ ...prev, role: e.target.value as EmployeeRole }))
              }
            />
            <TextInput
              label="เบอร์โทร"
              value={vm.employeeForm.phone}
              onChange={(next) =>
                vm.setEmployeeForm((prev) => {
                  const digits = next.replace(/\D/g, "").slice(0, 10);
                  if (digits.length > 0 && digits[0] !== "0") return prev;
                  return { ...prev, phone: digits };
                })
              }
              placeholder="0811112222"
            />
            <TextInput
              label="Username"
              value={vm.employeeForm.username}
              onChange={(next) => vm.setEmployeeForm((prev) => ({ ...prev, username: next }))}
              placeholder="janedoe"
            />
            <TextInput
              label="Password"
              value={vm.employeeForm.password}
              onChange={(next) => vm.setEmployeeForm((prev) => ({ ...prev, password: next }))}
              placeholder="secret"
              type="password"
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
              placeholder="ชื่อบริษัท"
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
              placeholder="เบอร์ติดต่อ"
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
              placeholder="ชื่อบริษัท"
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
              placeholder="เบอร์ติดต่อ"
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
