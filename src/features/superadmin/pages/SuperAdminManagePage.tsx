import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
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
  type CreateVehicleModelInput,
  type CreateVehicleTypeInput,
  type EmployeeItem,
  type EmployeeRole,
  type InsuranceCompanyItem,
  type VehicleBrandItem,
  type VehicleModelItem,
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

const defaultVehicleTypeForm: CreateVehicleTypeInput = {
  code: "",
  name: "",
  nameEn: "",
};

const defaultVehicleModelForm = {
  name: "",
  typeId: "",
};

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

  const [insurances, setInsurances] = useState<InsuranceCompanyItem[]>([]);
  const [insuranceForm, setInsuranceForm] =
    useState<CreateInsuranceCompanyInput>(defaultInsuranceForm);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  const [creatingInsurance, setCreatingInsurance] = useState(false);
  const [deletingInsuranceId, setDeletingInsuranceId] = useState<number | null>(
    null,
  );

  const [brands, setBrands] = useState<VehicleBrandItem[]>([]);
  const [brandForm, setBrandForm] =
    useState<CreateVehicleBrandInput>(defaultBrandForm);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeItem[]>([]);
  const [vehicleTypeForm, setVehicleTypeForm] =
    useState<CreateVehicleTypeInput>(defaultVehicleTypeForm);
  const [showVehicleTypeForm, setShowVehicleTypeForm] = useState(false);
  const [creatingVehicleType, setCreatingVehicleType] = useState(false);
  const [deletingVehicleTypeId, setDeletingVehicleTypeId] = useState<number | null>(
    null,
  );

  const [selectedBrandIdForModels, setSelectedBrandIdForModels] = useState<number | null>(
    null,
  );
  const [brandModels, setBrandModels] = useState<VehicleModelItem[]>([]);
  const [loadingBrandModels, setLoadingBrandModels] = useState(false);
  const [vehicleModelForm, setVehicleModelForm] = useState(defaultVehicleModelForm);
  const [showVehicleModelForm, setShowVehicleModelForm] = useState(false);
  const [creatingVehicleModel, setCreatingVehicleModel] = useState(false);
  const [deletingVehicleModelId, setDeletingVehicleModelId] = useState<number | null>(
    null,
  );

  const activeTabParam = searchParams.get("tab");
  const activeTab: ManageTab =
    activeTabParam === "insurances" || activeTabParam === "brands"
      ? activeTabParam
      : "employees";

  const activeLabel = useMemo(
    () => tabItems.find((tab) => tab.id === activeTab)?.label ?? "",
    [activeTab],
  );
  const selectedBrandForModels = useMemo(
    () => brands.find((brand) => brand.id === selectedBrandIdForModels) ?? null,
    [brands, selectedBrandIdForModels],
  );

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!brands.length) {
      setSelectedBrandIdForModels(null);
      setBrandModels([]);
      return;
    }

    setSelectedBrandIdForModels((prev) => {
      if (prev && brands.some((brand) => brand.id === prev)) return prev;
      return brands[0].id;
    });
  }, [brands]);

  useEffect(() => {
    if (!selectedBrandIdForModels) {
      setBrandModels([]);
      return;
    }
    void loadModelsByBrand(selectedBrandIdForModels);
  }, [selectedBrandIdForModels]);

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

  async function loadModelsByBrand(brandId: number) {
    try {
      setLoadingBrandModels(true);
      const list = await superadminService.listVehicleModelsByBrand(brandId);
      setBrandModels(list);
    } catch (e) {
      setBrandModels([]);
      toast.error(toThaiErrorMessage(e, "โหลดรุ่นรถไม่สำเร็จ"));
    } finally {
      setLoadingBrandModels(false);
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

  async function handleDeleteEmployee(id: number) {
    if (deletingEmployeeId) return;
    if (!window.confirm("ยืนยันลบพนักงานนี้ใช่หรือไม่?")) return;

    try {
      setDeletingEmployeeId(id);
      await superadminService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((item) => item.id !== id));
      toast.success("ลบพนักงานแล้ว");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "ลบพนักงานไม่สำเร็จ"));
    } finally {
      setDeletingEmployeeId(null);
    }
  }

  async function handleCreateInsurance(e: React.FormEvent) {
    e.preventDefault();
    if (creatingInsurance) return;

    const payload: CreateInsuranceCompanyInput = {
      ...insuranceForm,
      name: insuranceForm.name.trim(),
      contactPhone: insuranceForm.contactPhone.trim(),
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

  async function handleDeleteInsurance(id: number) {
    if (deletingInsuranceId) return;
    if (!window.confirm("ยืนยันลบบริษัทประกันภัยนี้ใช่หรือไม่?")) return;

    try {
      setDeletingInsuranceId(id);
      await superadminService.deleteInsurance(id);
      setInsurances((prev) => prev.filter((item) => item.id !== id));
      toast.success("ลบบริษัทประกันภัยแล้ว");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "ลบบริษัทประกันภัยไม่สำเร็จ"));
    } finally {
      setDeletingInsuranceId(null);
    }
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (creatingBrand) return;

    const payload: CreateVehicleBrandInput = {
      code: brandForm.code.trim().toLowerCase(),
      name: brandForm.name.trim(),
      nameEn: brandForm.nameEn.trim(),
      country: brandForm.country.trim(),
      logoUrl: brandForm.logoUrl.trim(),
    };

    if (!payload.code || !payload.name) {
      toast.error("กรุณากรอกรหัสและชื่อยี่ห้อรถ");
      return;
    }

    try {
      setCreatingBrand(true);
      const created = await superadminService.createVehicleBrand(payload);
      setBrands((prev) => [created, ...prev]);
      setSelectedBrandIdForModels(created.id);
      setBrandForm(defaultBrandForm);
      setShowBrandForm(false);
      toast.success("เพิ่มยี่ห้อรถสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "เพิ่มยี่ห้อรถไม่สำเร็จ"));
    } finally {
      setCreatingBrand(false);
    }
  }

  async function handleDeleteBrand(id: number) {
    if (deletingBrandId) return;
    if (!window.confirm("ยืนยันลบยี่ห้อรถนี้ใช่หรือไม่?")) return;

    try {
      setDeletingBrandId(id);
      await superadminService.deleteVehicleBrand(id);
      setBrands((prev) => prev.filter((item) => item.id !== id));
      if (selectedBrandIdForModels === id) {
        setSelectedBrandIdForModels(null);
      }
      toast.success("ลบยี่ห้อรถแล้ว");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "ลบยี่ห้อรถไม่สำเร็จ"));
    } finally {
      setDeletingBrandId(null);
    }
  }

  async function handleCreateVehicleType(e: React.FormEvent) {
    e.preventDefault();
    if (creatingVehicleType) return;

    const payload: CreateVehicleTypeInput = {
      code: vehicleTypeForm.code.trim().toLowerCase(),
      name: vehicleTypeForm.name.trim(),
      nameEn: vehicleTypeForm.nameEn.trim(),
    };

    if (!payload.code || !payload.name) {
      toast.error("กรุณากรอกรหัสและชื่อประเภทรถ");
      return;
    }

    try {
      setCreatingVehicleType(true);
      const created = await superadminService.createVehicleType(payload);
      setVehicleTypes((prev) => [created, ...prev]);
      setVehicleTypeForm(defaultVehicleTypeForm);
      setShowVehicleTypeForm(false);
      toast.success("เพิ่มประเภทรถสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "เพิ่มประเภทรถไม่สำเร็จ"));
    } finally {
      setCreatingVehicleType(false);
    }
  }

  async function handleDeleteVehicleType(id: number) {
    if (deletingVehicleTypeId) return;
    if (!window.confirm("ยืนยันลบประเภทรถนี้ใช่หรือไม่?")) return;

    try {
      setDeletingVehicleTypeId(id);
      await superadminService.deleteVehicleType(id);
      setVehicleTypes((prev) => prev.filter((item) => item.id !== id));
      if (vehicleModelForm.typeId === String(id)) {
        setVehicleModelForm((prev) => ({ ...prev, typeId: "" }));
      }
      toast.success("ลบประเภทรถแล้ว");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "ลบประเภทรถไม่สำเร็จ"));
    } finally {
      setDeletingVehicleTypeId(null);
    }
  }

  async function handleCreateVehicleModel(e: React.FormEvent) {
    e.preventDefault();
    if (creatingVehicleModel) return;
    if (!selectedBrandIdForModels) {
      toast.error("กรุณาเลือกยี่ห้อรถก่อน");
      return;
    }

    const payload: CreateVehicleModelInput = {
      brandId: selectedBrandIdForModels,
      name: vehicleModelForm.name.trim(),
      typeId: vehicleModelForm.typeId ? Number(vehicleModelForm.typeId) : null,
    };

    if (!payload.name || !payload.typeId) {
      toast.error("กรุณากรอกชื่อรุ่นและเลือกประเภทรถ");
      return;
    }

    try {
      setCreatingVehicleModel(true);
      await superadminService.createVehicleModel(payload);
      await loadModelsByBrand(selectedBrandIdForModels);
      setVehicleModelForm(defaultVehicleModelForm);
      setShowVehicleModelForm(false);
      toast.success("เพิ่มรุ่นรถสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "เพิ่มรุ่นรถไม่สำเร็จ"));
    } finally {
      setCreatingVehicleModel(false);
    }
  }

  async function handleDeleteVehicleModel(id: number) {
    if (deletingVehicleModelId || !selectedBrandIdForModels) return;
    if (!window.confirm("ยืนยันลบรุ่นรถนี้ใช่หรือไม่?")) return;

    try {
      setDeletingVehicleModelId(id);
      await superadminService.deleteVehicleModel(id);
      await loadModelsByBrand(selectedBrandIdForModels);
      toast.success("ลบรุ่นรถแล้ว");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "ลบรุ่นรถไม่สำเร็จ"));
    } finally {
      setDeletingVehicleModelId(null);
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

  function closeBrandForm() {
    if (creatingBrand) return;
    setBrandForm(defaultBrandForm);
    setShowBrandForm(false);
  }

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
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Role</th>
                  <th className="px-3 py-2 text-left font-medium">Phone</th>
                  <th className="px-3 py-2 text-left font-medium">Username</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(item.id)}
                        disabled={deletingEmployeeId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingEmployeeId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        ลบ
                      </button>
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

          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">จัดการประเภทรถ</h3>
                <p className="text-sm text-slate-500">เช่น Sedan, SUV, Pickup</p>
              </div>
              {!showVehicleTypeForm ? (
                <button
                  type="button"
                  onClick={() => setShowVehicleTypeForm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  เพิ่มประเภทรถ
                </button>
              ) : null}
            </div>

            {showVehicleTypeForm ? (
              <form
                onSubmit={handleCreateVehicleType}
                className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <TextInput
                  label="Code"
                  value={vehicleTypeForm.code}
                  onChange={(next) =>
                    setVehicleTypeForm((prev) => ({ ...prev, code: next }))
                  }
                  placeholder="suv"
                />
                <TextInput
                  label="ชื่อ"
                  value={vehicleTypeForm.name}
                  onChange={(next) =>
                    setVehicleTypeForm((prev) => ({ ...prev, name: next }))
                  }
                  placeholder="SUV"
                />
                <TextInput
                  label="Name EN"
                  value={vehicleTypeForm.nameEn}
                  onChange={(next) =>
                    setVehicleTypeForm((prev) => ({ ...prev, nameEn: next }))
                  }
                  placeholder="SUV"
                />

                <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (creatingVehicleType) return;
                      setVehicleTypeForm(defaultVehicleTypeForm);
                      setShowVehicleTypeForm(false);
                    }}
                    disabled={creatingVehicleType}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={creatingVehicleType}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingVehicleType ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    บันทึกประเภทรถ
                  </button>
                </div>
              </form>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Code</th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Name EN</th>
                    <th className="px-3 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleTypes.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200 bg-white">
                      <td className="px-3 py-2">{item.code}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">{item.nameEn || "-"}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicleType(item.id)}
                          disabled={deletingVehicleTypeId === item.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingVehicleTypeId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          ลบ
                        </button>
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

          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">จัดการรุ่นรถ</h3>
                <p className="text-sm text-slate-500">
                  เพิ่มรุ่นรถตามยี่ห้อ เช่น Toyota - Vios
                </p>
              </div>
              {!showVehicleModelForm ? (
                <button
                  type="button"
                  onClick={() => setShowVehicleModelForm(true)}
                  disabled={!selectedBrandIdForModels}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  เพิ่มรุ่นรถ
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800">ยี่ห้อรถ</label>
                <select
                  value={selectedBrandIdForModels ?? ""}
                  onChange={(e) =>
                    setSelectedBrandIdForModels(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
                >
                  <option value="">เลือกยี่ห้อรถ</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                ยี่ห้อที่เลือก: {selectedBrandForModels?.name ?? "-"}
              </div>
            </div>

            {showVehicleModelForm ? (
              <form
                onSubmit={handleCreateVehicleModel}
                className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <TextInput
                  label="ชื่อรุ่น"
                  value={vehicleModelForm.name}
                  onChange={(next) =>
                    setVehicleModelForm((prev) => ({ ...prev, name: next }))
                  }
                  placeholder="Vios"
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-800">ประเภทรถ</label>
                  <select
                    value={vehicleModelForm.typeId}
                    onChange={(e) =>
                      setVehicleModelForm((prev) => ({
                        ...prev,
                        typeId: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
                  >
                    <option value="">เลือกประเภทรถ</option>
                    {vehicleTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="xl:col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (creatingVehicleModel) return;
                      setVehicleModelForm(defaultVehicleModelForm);
                      setShowVehicleModelForm(false);
                    }}
                    disabled={creatingVehicleModel}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={creatingVehicleModel || !selectedBrandIdForModels}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingVehicleModel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    บันทึกรุ่นรถ
                  </button>
                </div>
              </form>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Model</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBrandModels ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                        กำลังโหลดรุ่นรถ...
                      </td>
                    </tr>
                  ) : null}
                  {!loadingBrandModels &&
                    brandModels.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200 bg-white">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.type?.name || "-"}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicleModel(item.id)}
                            disabled={deletingVehicleModelId === item.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingVehicleModelId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!loadingBrandModels && brandModels.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                        ยังไม่มีข้อมูลรุ่นรถ
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
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
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Contact</th>
                  <th className="px-3 py-2 text-left font-medium">Logo URL</th>
                  <th className="px-3 py-2 text-left font-medium">Active</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {insurances.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 bg-white">
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.contactPhone || "-"}</td>
                    <td className="px-3 py-2 max-w-[280px] truncate">{item.logoUrl || "-"}</td>
                    <td className="px-3 py-2">{item.isActive ? "ใช่" : "ไม่"}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteInsurance(item.id)}
                        disabled={deletingInsuranceId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingInsuranceId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
                {insurances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
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
          headerAction={
            <button
              type="button"
              onClick={() => setShowBrandForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              เพิ่มยี่ห้อรถ
            </button>
          }
        >
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Name EN</th>
                  <th className="px-3 py-2 text-left font-medium">Country</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(item.id)}
                        disabled={deletingBrandId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingBrandId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        ลบ
                      </button>
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
                setEmployeeForm((prev) => ({
                  ...prev,
                  phone: next.replace(/\D/g, "").slice(0, 10),
                }))
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
                setInsuranceForm((prev) => ({ ...prev, contactPhone: next }))
              }
              placeholder="02xxxxxxx"
            />
            <TextInput
              label="Logo URL"
              value={insuranceForm.logoUrl}
              onChange={(next) =>
                setInsuranceForm((prev) => ({ ...prev, logoUrl: next }))
              }
              placeholder="https://..."
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

      {showBrandForm ? (
        <FormModal
          title="จัดการยี่ห้อรถ"
          onClose={closeBrandForm}
          disableClose={creatingBrand}
        >
          <form
            onSubmit={handleCreateBrand}
            className="flex h-full flex-col gap-4"
          >
            <TextInput
              label="Code"
              value={brandForm.code}
              onChange={(next) =>
                setBrandForm((prev) => ({ ...prev, code: next }))
              }
              placeholder="toyota"
            />
            <TextInput
              label="ชื่อ"
              value={brandForm.name}
              onChange={(next) =>
                setBrandForm((prev) => ({ ...prev, name: next }))
              }
              placeholder="โตโยต้า"
            />
            <TextInput
              label="Name EN"
              value={brandForm.nameEn}
              onChange={(next) =>
                setBrandForm((prev) => ({ ...prev, nameEn: next }))
              }
              placeholder="Toyota"
            />
            <TextInput
              label="ประเทศ"
              value={brandForm.country}
              onChange={(next) =>
                setBrandForm((prev) => ({ ...prev, country: next }))
              }
              placeholder="ญี่ปุ่น"
            />
            <TextInput
              label="Logo URL"
              value={brandForm.logoUrl}
              onChange={(next) =>
                setBrandForm((prev) => ({ ...prev, logoUrl: next }))
              }
              placeholder="https://..."
            />

            <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeBrandForm}
                disabled={creatingBrand}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={creatingBrand}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                บันทึกยี่ห้อรถ
              </button>
            </div>
          </form>
        </FormModal>
      ) : null}
    </div>
  );
}
