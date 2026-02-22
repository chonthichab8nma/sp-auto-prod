import { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import Skeleton from "../../../shared/components/ui/Skeleton";
import ModalPortal from "../../../shared/components/ui/ModalPortal";
import FormSelect from "../../../shared/components/form/FormSelect";
import {
  superadminService,
  type CreateEmployeeInput,
  type CreateInsuranceCompanyInput,
  type CreateVehicleBrandInput,
  type CreateVehicleTypeInput,
  type EmployeeItem,
  type EmployeeRole,
  type InsuranceCompanyItem,
  type VehicleBrandItem,
  type VehicleTypeItem,
} from "../services/superadmin.service";

type ManageTab = "employees" | "insurances" | "brands";

const roleLabel: Record<EmployeeRole, string> = {
  admin: "admin",
  staff: "staff",
};

const tabItems: { id: ManageTab; label: string }[] = [
  { id: "employees", label: "จัดการพนักงาน" },
  { id: "insurances", label: "จัดการบริษัทประกันภัย" },
  { id: "brands", label: "จัดการยี่ห้อรถ" },
];

const defaultEmployeeForm: CreateEmployeeInput = {
  name: "",
  role: "staff",
  phone: "",
  username: "",
  password: "",
};

const defaultInsuranceForm: CreateInsuranceCompanyInput = {
  name: "",
  contactPhone: "",
  logoUrl: "",
  isActive: true,
};

const defaultBrandForm: CreateVehicleBrandInput = {
  code: "",
  name: "",
  nameEn: "",
  country: "",
  logoUrl: "",
};

type GroupBrandMode = "existing" | "new";
type GroupTypeMode = "existing" | "new";

const defaultGroupedCreateForm = {
  brandMode: "existing" as GroupBrandMode,
  existingBrandId: "",
  brandCode: "",
  brandName: "",
  brandNameEn: "",
  brandCountry: "",
  brandLogoUrl: "",
  modelName: "",
  typeMode: "existing" as GroupTypeMode,
  existingTypeId: "",
  typeCode: "",
  typeName: "",
  typeNameEn: "",
};

type DeleteTarget =
  | { type: "employee"; id: number; name: string }
  | { type: "insurance"; id: number; name: string }
  | { type: "brand"; id: number; name: string };

function SectionWrapper({
  title,
  description,
  headerAction,
  children,
}: {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  type?: "text" | "password";
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
      />
    </div>
  );
}

function FormModal({
  title,
  onClose,
  disableClose = false,
  children,
}: {
  title: string;
  onClose: () => void;
  disableClose?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          className="absolute inset-0 bg-black/45"
          onClick={() => {
            if (disableClose) return;
            onClose();
          }}
          aria-label="close modal"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative flex w-full max-w-[720px] max-h-[92vh] flex-col rounded-none border border-slate-200 bg-white p-6 shadow-2xl md:aspect-square md:p-7">
            <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={() => {
                  if (disableClose) return;
                  onClose();
                }}
                disabled={disableClose}
                className="p-1 text-slate-700 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">{children}</div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60]">
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          onClick={() => {
            if (loading) return;
            onClose();
          }}
          aria-label="close confirm modal"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={() => {
                  if (loading) return;
                  onClose();
                }}
                disabled={loading}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{message}</p>
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function EmployeeSectionSkeleton() {
  return (
    <SectionWrapper
      title="จัดการพนักงาน"
      description="กำหนด role ได้เฉพาะ admin และ staff พร้อมเพิ่ม/ลบ"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`employee-input-skeleton-${index}`} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="md:col-span-2 xl:col-span-5 flex justify-end">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <div className="grid min-w-[720px] grid-cols-5 gap-3 bg-slate-50 px-3 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`employee-row-skeleton-${index}`}
              className="grid min-w-[720px] grid-cols-5 gap-3 border-t border-slate-200 px-3 py-3"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-36" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export default function SuperAdminManagePage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeInput>(
    defaultEmployeeForm,
  );
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(
    null,
  );
  const [updatingEmployeePasswordId, setUpdatingEmployeePasswordId] = useState<number | null>(
    null,
  );
  const [employeePasswordTarget, setEmployeePasswordTarget] = useState<EmployeeItem | null>(null);
  const [employeePassword, setEmployeePassword] = useState("");

  const [insurances, setInsurances] = useState<InsuranceCompanyItem[]>([]);
  const [insuranceForm, setInsuranceForm] =
    useState<CreateInsuranceCompanyInput>(defaultInsuranceForm);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  const [creatingInsurance, setCreatingInsurance] = useState(false);
  const [editingInsuranceId, setEditingInsuranceId] = useState<number | null>(null);
  const [insuranceEditTarget, setInsuranceEditTarget] = useState<InsuranceCompanyItem | null>(
    null,
  );
  const [insuranceEditForm, setInsuranceEditForm] =
    useState<CreateInsuranceCompanyInput>(defaultInsuranceForm);
  const [deletingInsuranceId, setDeletingInsuranceId] = useState<number | null>(
    null,
  );

  const [brands, setBrands] = useState<VehicleBrandItem[]>([]);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [brandEditTarget, setBrandEditTarget] = useState<VehicleBrandItem | null>(null);
  const [brandEditForm, setBrandEditForm] = useState<CreateVehicleBrandInput>(defaultBrandForm);
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeItem[]>([]);
  const [groupedCreateForm, setGroupedCreateForm] = useState(defaultGroupedCreateForm);
  const [creatingGrouped, setCreatingGrouped] = useState(false);

  const activeTabParam = searchParams.get("tab");
  const activeTab: ManageTab =
    activeTabParam === "insurances" || activeTabParam === "brands"
      ? activeTabParam
      : "employees";

  const activeLabel = useMemo(
    () => tabItems.find((tab) => tab.id === activeTab)?.label ?? "",
    [activeTab],
  );

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [employeeList, insuranceList, brandList, vehicleTypeList] = await Promise.all([
        superadminService.listEmployees(),
        superadminService.listInsurances(),
        superadminService.listVehicleBrands(),
        superadminService.listVehicleTypes(),
      ]);

      setEmployees(employeeList);
      setInsurances(insuranceList);
      setBrands(brandList);
      setVehicleTypes(vehicleTypeList);
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "โหลดข้อมูลจัดการระบบไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (creatingEmployee) return;

    const payload: CreateEmployeeInput = {
      ...employeeForm,
      phone: employeeForm.phone.replace(/\D/g, "").slice(0, 10),
      username: employeeForm.username.trim(),
      name: employeeForm.name.trim(),
      password: employeeForm.password.trim(),
    };

    if (
      !payload.name ||
      !payload.phone ||
      !payload.username ||
      !payload.password
    ) {
      toast.error("กรุณากรอกข้อมูลพนักงานให้ครบ");
      return;
    }

    if (!payload.phone.startsWith("0")) {
      toast.error("เบอร์โทรพนักงานต้องขึ้นต้นด้วย 0");
      return;
    }

    try {
      setCreatingEmployee(true);
      const created = await superadminService.createEmployee(payload);
      setEmployees((prev) => [created, ...prev]);
      setEmployeeForm(defaultEmployeeForm);
      setShowEmployeeForm(false);
      toast.success("เพิ่มพนักงานสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "เพิ่มพนักงานไม่สำเร็จ"));
    } finally {
      setCreatingEmployee(false);
    }
  }

  async function handleUpdateEmployeePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!employeePasswordTarget || updatingEmployeePasswordId) return;

    const password = employeePassword.trim();
    if (!password) {
      toast.error("กรุณากรอกรหัสผ่านใหม่");
      return;
    }

    try {
      setUpdatingEmployeePasswordId(employeePasswordTarget.id);
      const updated = await superadminService.updateEmployeePassword(
        employeePasswordTarget.id,
        password,
      );
      setEmployees((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setEmployeePasswordTarget(null);
      setEmployeePassword("");
      toast.success("แก้ไขรหัสผ่านพนักงานสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "แก้ไขรหัสผ่านพนักงานไม่สำเร็จ"));
    } finally {
      setUpdatingEmployeePasswordId(null);
    }
  }

  async function handleCreateInsurance(e: React.FormEvent) {
    e.preventDefault();
    if (creatingInsurance) return;

    const payload: CreateInsuranceCompanyInput = {
      ...insuranceForm,
      name: insuranceForm.name.trim(),
      contactPhone: insuranceForm.contactPhone.replace(/\D/g, "").trim(),
      logoUrl: insuranceForm.logoUrl.trim(),
    };

    if (!payload.name) {
      toast.error("กรุณากรอกชื่อบริษัทประกันภัย");
      return;
    }

    try {
      setCreatingInsurance(true);
      const created = await superadminService.createInsurance(payload);
      setInsurances((prev) => [created, ...prev]);
      setInsuranceForm(defaultInsuranceForm);
      setShowInsuranceForm(false);
      toast.success("เพิ่มบริษัทประกันภัยสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "เพิ่มบริษัทประกันภัยไม่สำเร็จ"));
    } finally {
      setCreatingInsurance(false);
    }
  }

  function openInsuranceEditModal(item: InsuranceCompanyItem) {
    setInsuranceEditTarget(item);
    setInsuranceEditForm({
      name: item.name ?? "",
      contactPhone: item.contactPhone ?? "",
      logoUrl: item.logoUrl ?? "",
      isActive: item.isActive ?? true,
    });
  }

  async function handleUpdateInsurance(e: React.FormEvent) {
    e.preventDefault();
    if (!insuranceEditTarget || editingInsuranceId) return;

    const payload: CreateInsuranceCompanyInput = {
      name: insuranceEditForm.name.trim(),
      contactPhone: insuranceEditForm.contactPhone.replace(/\D/g, "").trim(),
      logoUrl: insuranceEditForm.logoUrl.trim(),
      isActive: insuranceEditForm.isActive,
    };

    if (!payload.name) {
      toast.error("กรุณากรอกชื่อบริษัทประกันภัย");
      return;
    }

    try {
      setEditingInsuranceId(insuranceEditTarget.id);
      const updated = await superadminService.updateInsurance(insuranceEditTarget.id, payload);
      setInsurances((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setInsuranceEditTarget(null);
      setInsuranceEditForm(defaultInsuranceForm);
      toast.success("แก้ไขบริษัทประกันภัยสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "แก้ไขบริษัทประกันภัยไม่สำเร็จ"));
    } finally {
      setEditingInsuranceId(null);
    }
  }

  function openBrandEditModal(item: VehicleBrandItem) {
    setBrandEditTarget(item);
    setBrandEditForm({
      code: item.code ?? "",
      name: item.name ?? "",
      nameEn: item.nameEn ?? "",
      country: item.country ?? "",
      logoUrl: item.logoUrl ?? "",
    });
  }

  async function handleUpdateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!brandEditTarget || editingBrandId) return;

    const payload: CreateVehicleBrandInput = {
      code: brandEditForm.code.trim().toLowerCase(),
      name: brandEditForm.name.trim(),
      nameEn: brandEditForm.nameEn.trim(),
      country: brandEditForm.country.trim(),
      logoUrl: brandEditForm.logoUrl.trim(),
    };

    if (!payload.code || !payload.name) {
      toast.error("กรุณากรอกรหัสและชื่อยี่ห้อรถ");
      return;
    }

    try {
      setEditingBrandId(brandEditTarget.id);
      const updated = await superadminService.updateVehicleBrand(brandEditTarget.id, payload);
      setBrands((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setBrandEditTarget(null);
      setBrandEditForm(defaultBrandForm);
      toast.success("แก้ไขยี่ห้อรถสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "แก้ไขยี่ห้อรถไม่สำเร็จ"));
    } finally {
      setEditingBrandId(null);
    }
  }

  function openDeleteModal(target: DeleteTarget) {
    setDeleteTarget(target);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "employee") {
        setDeletingEmployeeId(deleteTarget.id);
        await superadminService.deleteEmployee(deleteTarget.id);
        setEmployees((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        toast.success("ลบพนักงานแล้ว");
      }

      if (deleteTarget.type === "insurance") {
        setDeletingInsuranceId(deleteTarget.id);
        await superadminService.deleteInsurance(deleteTarget.id);
        setInsurances((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        toast.success("ลบบริษัทประกันภัยแล้ว");
      }

      if (deleteTarget.type === "brand") {
        setDeletingBrandId(deleteTarget.id);
        await superadminService.deleteVehicleBrand(deleteTarget.id);
        setBrands((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        toast.success("ลบยี่ห้อรถแล้ว");
      }

      setDeleteTarget(null);
    } catch (e) {
      if (deleteTarget.type === "employee") {
        toast.error(toThaiErrorMessage(e, "ลบพนักงานไม่สำเร็จ"));
      }
      if (deleteTarget.type === "insurance") {
        toast.error(toThaiErrorMessage(e, "ลบบริษัทประกันภัยไม่สำเร็จ"));
      }
      if (deleteTarget.type === "brand") {
        toast.error(toThaiErrorMessage(e, "ลบยี่ห้อรถไม่สำเร็จ"));
      }
    } finally {
      setDeletingEmployeeId(null);
      setDeletingInsuranceId(null);
      setDeletingBrandId(null);
    }
  }

  async function handleCreateGroupedVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (creatingGrouped) return;

    try {
      setCreatingGrouped(true);

      let brandId: number;
      if (groupedCreateForm.brandMode === "existing") {
        brandId = Number(groupedCreateForm.existingBrandId);
        if (!brandId) {
          toast.error("กรุณาเลือกยี่ห้อรถ");
          return;
        }
      } else {
        const brandPayload: CreateVehicleBrandInput = {
          code: groupedCreateForm.brandCode.trim().toLowerCase(),
          name: groupedCreateForm.brandName.trim(),
          nameEn: groupedCreateForm.brandNameEn.trim(),
          country: groupedCreateForm.brandCountry.trim(),
          logoUrl: groupedCreateForm.brandLogoUrl.trim(),
        };
        if (!brandPayload.code || !brandPayload.name) {
          toast.error("กรุณากรอกรหัสและชื่อยี่ห้อรถ");
          return;
        }
        const createdBrand = await superadminService.createVehicleBrand(brandPayload);
        setBrands((prev) => [createdBrand, ...prev]);
        brandId = createdBrand.id;
      }

      let typeId: number;
      if (groupedCreateForm.typeMode === "existing") {
        typeId = Number(groupedCreateForm.existingTypeId);
        if (!typeId) {
          toast.error("กรุณาเลือกประเภทรถ");
          return;
        }
      } else {
        const typePayload: CreateVehicleTypeInput = {
          code: groupedCreateForm.typeCode.trim().toLowerCase(),
          name: groupedCreateForm.typeName.trim(),
          nameEn: groupedCreateForm.typeNameEn.trim(),
        };
        if (!typePayload.code || !typePayload.name) {
          toast.error("กรุณากรอกรหัสและชื่อประเภทรถ");
          return;
        }
        const createdType = await superadminService.createVehicleType(typePayload);
        setVehicleTypes((prev) => [createdType, ...prev]);
        typeId = createdType.id;
      }

      const modelName = groupedCreateForm.modelName.trim();
      if (!modelName) {
        toast.error("กรุณากรอกชื่อรุ่นรถ");
        return;
      }

      await superadminService.createVehicleModel({
        brandId,
        name: modelName,
        typeId,
      });

      setGroupedCreateForm({
        ...defaultGroupedCreateForm,
        brandMode: "existing",
        existingBrandId: String(brandId),
      });
      toast.success("เพิ่มข้อมูลรถสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "เพิ่มข้อมูลรถไม่สำเร็จ"));
    } finally {
      setCreatingGrouped(false);
    }
  }

  function closeEmployeeForm() {
    if (creatingEmployee) return;
    setEmployeeForm(defaultEmployeeForm);
    setShowEmployeeForm(false);
  }

  function closeInsuranceForm() {
    if (creatingInsurance) return;
    setInsuranceForm(defaultInsuranceForm);
    setShowInsuranceForm(false);
  }

  function closeEmployeePasswordModal() {
    if (updatingEmployeePasswordId) return;
    setEmployeePasswordTarget(null);
    setEmployeePassword("");
  }

  function closeInsuranceEditModal() {
    if (editingInsuranceId) return;
    setInsuranceEditTarget(null);
    setInsuranceEditForm(defaultInsuranceForm);
  }

  function closeBrandEditModal() {
    if (editingBrandId) return;
    setBrandEditTarget(null);
    setBrandEditForm(defaultBrandForm);
  }

  const deletingWithModal =
    deleteTarget?.type === "employee"
      ? deletingEmployeeId === deleteTarget.id
      : deleteTarget?.type === "insurance"
        ? deletingInsuranceId === deleteTarget.id
        : deleteTarget?.type === "brand"
          ? deletingBrandId === deleteTarget.id
          : false;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">จัดการข้อมูลระบบ</h1>
      </section>

      {loading && activeTab === "employees" ? <EmployeeSectionSkeleton /> : null}

      {loading && activeTab !== "employees" ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดข้อมูล {activeLabel}
          </span>
        </div>
      ) : null}

      {!loading && activeTab === "employees" ? (
        <SectionWrapper
          title="จัดการพนักงาน"
          description=""
          headerAction={
            <button
              type="button"
              onClick={() => setShowEmployeeForm(true)}
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
                          onClick={() => {
                            setEmployeePasswordTarget(item);
                            setEmployeePassword("");
                          }}
                          disabled={updatingEmployeePasswordId === item.id}
                          className="inline-flex min-w-[110px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          แก้รหัสผ่าน
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal({
                              type: "employee",
                              id: item.id,
                              name: item.name,
                            })
                          }
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
      ) : null}

      {!loading && activeTab === "insurances" ? (
        <SectionWrapper
          title="จัดการบริษัทประกันภัย"
          description=""
          headerAction={
            <button
              type="button"
              onClick={() => setShowInsuranceForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              เพิ่มบริษัทประกันภัย
            </button>
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
                    <td className="px-3 py-2">{item.isActive ? "ใช่" : "ไม่"}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openInsuranceEditModal(item)}
                          disabled={editingInsuranceId === item.id}
                          className="inline-flex min-w-[78px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {editingInsuranceId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Pencil className="h-3.5 w-3.5" />
                          )}
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal({
                              type: "insurance",
                              id: item.id,
                              name: item.name,
                            })
                          }
                          disabled={deletingInsuranceId === item.id}
                          className="inline-flex min-w-[64px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:-translate-y-[1px] hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingInsuranceId === item.id ? (
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
      ) : null}

      {!loading && activeTab === "brands" ? (
        <SectionWrapper
          title="จัดการยี่ห้อรถ"
          description=""
        >
          <div className="mt-5 space-y-5">
            <form
              onSubmit={handleCreateGroupedVehicle}
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
                      onClick={() =>
                        setGroupedCreateForm((prev) => ({
                          ...prev,
                          brandMode: "existing",
                        }))
                      }
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
                      onClick={() =>
                        setGroupedCreateForm((prev) => ({
                          ...prev,
                          brandMode: "new",
                        }))
                      }
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
                      onChange={(e) =>
                        setGroupedCreateForm((prev) => ({
                          ...prev,
                          existingBrandId: e.target.value,
                        }))
                      }
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
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            brandCode: e.target.value,
                          }))
                        }
                        placeholder="Code"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                      />
                      <input
                        value={groupedCreateForm.brandName}
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            brandName: e.target.value,
                          }))
                        }
                        placeholder="ชื่อยี่ห้อ"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                      />
                      <input
                        value={groupedCreateForm.brandNameEn}
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            brandNameEn: e.target.value,
                          }))
                        }
                        placeholder="Name EN (optional)"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                      />
                      <input
                        value={groupedCreateForm.brandCountry}
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            brandCountry: e.target.value,
                          }))
                        }
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
                      onChange={(e) =>
                        setGroupedCreateForm((prev) => ({
                          ...prev,
                          modelName: e.target.value,
                        }))
                      }
                      placeholder="ชื่อรุ่น เช่น A1"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            typeMode: "existing",
                          }))
                        }
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
                        onClick={() =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            typeMode: "new",
                          }))
                        }
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
                      onChange={(e) =>
                        setGroupedCreateForm((prev) => ({
                          ...prev,
                          existingTypeId: e.target.value,
                        }))
                      }
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
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            typeCode: e.target.value,
                          }))
                        }
                        placeholder="Type code"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                      />
                      <input
                        value={groupedCreateForm.typeName}
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            typeName: e.target.value,
                          }))
                        }
                        placeholder="ชื่อประเภท"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                      />
                      <input
                        value={groupedCreateForm.typeNameEn}
                        onChange={(e) =>
                          setGroupedCreateForm((prev) => ({
                            ...prev,
                            typeNameEn: e.target.value,
                          }))
                        }
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
                  onClick={() => setGroupedCreateForm(defaultGroupedCreateForm)}
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
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">รายการยี่ห้อรถทั้งหมด</h3>
                  <p className="text-sm text-slate-500">ใช้สำหรับแก้ไข/ลบข้อมูลยี่ห้อรถ</p>
                </div>
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
                              onClick={() => openBrandEditModal(item)}
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
                              onClick={() =>
                                openDeleteModal({
                                  type: "brand",
                                  id: item.id,
                                  name: item.name,
                                })
                              }
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
      ) : null}

      {showEmployeeForm ? (
        <FormModal
          title="จัดการพนักงาน"
          onClose={closeEmployeeForm}
          disableClose={creatingEmployee}
        >
          <form
            onSubmit={handleCreateEmployee}
            className="flex h-full flex-col gap-4"
          >
            <TextInput
              label="ชื่อ"
              value={employeeForm.name}
              onChange={(next) =>
                setEmployeeForm((prev) => ({ ...prev, name: next }))
              }
              placeholder="Jane Doe"
            />
            <FormSelect
              label="Role"
              value={employeeForm.role}
              options={["staff", "admin"]}
              onChange={(e) =>
                setEmployeeForm((prev) => ({
                  ...prev,
                  role: e.target.value as EmployeeRole,
                }))
              }
            />
            <TextInput
              label="เบอร์โทร"
              value={employeeForm.phone}
              onChange={(next) =>
                setEmployeeForm((prev) => {
                  const digits = next.replace(/\D/g, "").slice(0, 10);
                  if (digits.length > 0 && digits[0] !== "0") return prev;
                  return { ...prev, phone: digits };
                })
              }
              placeholder="0811112222"
            />
            <TextInput
              label="Username"
              value={employeeForm.username}
              onChange={(next) =>
                setEmployeeForm((prev) => ({ ...prev, username: next }))
              }
              placeholder="janedoe"
            />
            <TextInput
              label="Password"
              value={employeeForm.password}
              onChange={(next) =>
                setEmployeeForm((prev) => ({ ...prev, password: next }))
              }
              placeholder="secret"
              type="password"
            />

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeEmployeeForm}
                disabled={creatingEmployee}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={creatingEmployee}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingEmployee ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกพนักงาน
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {showInsuranceForm ? (
        <FormModal
          title="จัดการบริษัทประกันภัย"
          onClose={closeInsuranceForm}
          disableClose={creatingInsurance}
        >
          <form
            onSubmit={handleCreateInsurance}
            className="flex h-full flex-col gap-4"
          >
            <TextInput
              label="ชื่อบริษัท"
              value={insuranceForm.name}
              onChange={(next) =>
                setInsuranceForm((prev) => ({ ...prev, name: next }))
              }
              placeholder="ชื่อบริษัท"
            />
            <TextInput
              label="เบอร์ติดต่อ"
              value={insuranceForm.contactPhone}
              onChange={(next) =>
                setInsuranceForm((prev) => ({
                  ...prev,
                  contactPhone: next.replace(/\D/g, ""),
                }))
              }
              placeholder="เบอร์ติดต่อ "
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                id="insurance-active"
                type="checkbox"
                checked={insuranceForm.isActive}
                onChange={(e) =>
                  setInsuranceForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
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
                onClick={closeInsuranceForm}
                disabled={creatingInsurance}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={creatingInsurance}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingInsurance ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกบริษัทประกันภัย
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {employeePasswordTarget ? (
        <FormModal
          title="แก้ไขรหัสผ่านพนักงาน"
          onClose={closeEmployeePasswordModal}
          disableClose={Boolean(updatingEmployeePasswordId)}
        >
          <form onSubmit={handleUpdateEmployeePassword} className="flex h-full flex-col gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              พนักงาน: {employeePasswordTarget.name}
            </div>
            <TextInput
              label="รหัสผ่านใหม่"
              value={employeePassword}
              onChange={setEmployeePassword}
              placeholder="กรอกรหัสผ่านใหม่"
              type="password"
            />
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeEmployeePasswordModal}
                disabled={Boolean(updatingEmployeePasswordId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(updatingEmployeePasswordId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingEmployeePasswordId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกรหัสผ่าน
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {insuranceEditTarget ? (
        <FormModal
          title="แก้ไขบริษัทประกันภัย"
          onClose={closeInsuranceEditModal}
          disableClose={Boolean(editingInsuranceId)}
        >
          <form onSubmit={handleUpdateInsurance} className="flex h-full flex-col gap-4">
            <TextInput
              label="ชื่อบริษัท"
              value={insuranceEditForm.name}
              onChange={(next) =>
                setInsuranceEditForm((prev) => ({ ...prev, name: next }))
              }
              placeholder="ชื่อบริษัท"
            />
            <TextInput
              label="เบอร์ติดต่อ"
              value={insuranceEditForm.contactPhone}
              onChange={(next) =>
                setInsuranceEditForm((prev) => ({
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
                checked={insuranceEditForm.isActive}
                onChange={(e) =>
                  setInsuranceEditForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
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
                onClick={closeInsuranceEditModal}
                disabled={Boolean(editingInsuranceId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(editingInsuranceId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingInsuranceId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {brandEditTarget ? (
        <FormModal
          title="แก้ไขยี่ห้อรถ"
          onClose={closeBrandEditModal}
          disableClose={Boolean(editingBrandId)}
        >
          <form onSubmit={handleUpdateBrand} className="flex h-full flex-col gap-4">
            <TextInput
              label="Code"
              value={brandEditForm.code}
              onChange={(next) => setBrandEditForm((prev) => ({ ...prev, code: next }))}
              placeholder="toyota"
            />
            <TextInput
              label="ชื่อ"
              value={brandEditForm.name}
              onChange={(next) => setBrandEditForm((prev) => ({ ...prev, name: next }))}
              placeholder="โตโยต้า"
            />
            <TextInput
              label="Name EN"
              value={brandEditForm.nameEn}
              onChange={(next) => setBrandEditForm((prev) => ({ ...prev, nameEn: next }))}
              placeholder="Toyota"
            />
            <TextInput
              label="ประเทศ"
              value={brandEditForm.country}
              onChange={(next) => setBrandEditForm((prev) => ({ ...prev, country: next }))}
              placeholder="ญี่ปุ่น"
            />
            <TextInput
              label="Logo URL"
              value={brandEditForm.logoUrl}
              onChange={(next) => setBrandEditForm((prev) => ({ ...prev, logoUrl: next }))}
              placeholder="https://..."
            />
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeBrandEditModal}
                disabled={Boolean(editingBrandId)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={Boolean(editingBrandId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingBrandId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="ยืนยันการลบข้อมูล"
          message={`ยืนยันลบ ${deleteTarget.name} ใช่หรือไม่?`}
          confirmLabel="ยืนยันลบ"
          danger
          loading={deletingWithModal}
          onClose={() => {
            if (deletingWithModal) return;
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  );
}
