import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import {
  superadminService,
  type CreateEmployeeInput,
  type CreateInsuranceCompanyInput,
  type CreateVehicleBrandInput,
  type EmployeeItem,
  type EmployeeRole,
  type InsuranceCompanyItem,
  type VehicleBrandItem,
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

function SectionWrapper({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
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

export default function SuperAdminManagePage() {
  const [activeTab, setActiveTab] = useState<ManageTab>("employees");
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeInput>(
    defaultEmployeeForm,
  );
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(
    null,
  );

  const [insurances, setInsurances] = useState<InsuranceCompanyItem[]>([]);
  const [insuranceForm, setInsuranceForm] =
    useState<CreateInsuranceCompanyInput>(defaultInsuranceForm);
  const [creatingInsurance, setCreatingInsurance] = useState(false);
  const [deletingInsuranceId, setDeletingInsuranceId] = useState<number | null>(
    null,
  );

  const [brands, setBrands] = useState<VehicleBrandItem[]>([]);
  const [brandForm, setBrandForm] =
    useState<CreateVehicleBrandInput>(defaultBrandForm);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);

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
      const [employeeList, insuranceList, brandList] = await Promise.all([
        superadminService.listEmployees(),
        superadminService.listInsurances(),
        superadminService.listVehicleBrands(),
      ]);

      setEmployees(employeeList);
      setInsurances(insuranceList);
      setBrands(brandList);
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

    try {
      setCreatingEmployee(true);
      const created = await superadminService.createEmployee(payload);
      setEmployees((prev) => [created, ...prev]);
      setEmployeeForm(defaultEmployeeForm);
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
      setBrandForm(defaultBrandForm);
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
      toast.success("ลบยี่ห้อรถแล้ว");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "ลบยี่ห้อรถไม่สำเร็จ"));
    } finally {
      setDeletingBrandId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">จัดการข้อมูลระบบ</h1>
        <p className="mt-1 text-sm text-slate-500">
          สำหรับ superadmin: เพิ่ม/ลบพนักงาน, บริษัทประกันภัย และยี่ห้อรถ
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
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
          description="กำหนด role ได้เฉพาะ admin และ staff พร้อมเพิ่ม/ลบ"
        >
          <form
            onSubmit={handleCreateEmployee}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
          >
            <TextInput
              label="ชื่อ"
              value={employeeForm.name}
              onChange={(next) =>
                setEmployeeForm((prev) => ({ ...prev, name: next }))
              }
              placeholder="Jane Doe"
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-800">Role</label>
              <select
                value={employeeForm.role}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    role: e.target.value as EmployeeRole,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
              >
                <option value="staff">staff</option>
                <option value="admin">admin</option>
              </select>
            </div>
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

            <div className="md:col-span-2 xl:col-span-5 flex justify-end">
              <button
                type="submit"
                disabled={creatingEmployee}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingEmployee ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                เพิ่มพนักงาน
              </button>
            </div>
          </form>

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
        </SectionWrapper>
      ) : null}

      {!loading && activeTab === "insurances" ? (
        <SectionWrapper
          title="จัดการบริษัทประกันภัย"
          description="เพิ่ม/ลบบริษัทประกันภัย พร้อมสถานะเปิดใช้งาน"
        >
          <form
            onSubmit={handleCreateInsurance}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
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
            <div className="flex items-center gap-2 pt-8">
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

            <div className="md:col-span-2 xl:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={creatingInsurance}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingInsurance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                เพิ่มบริษัทประกันภัย
              </button>
            </div>
          </form>

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
          description="เพิ่ม/ลบข้อมูลยี่ห้อรถสำหรับใช้งานในระบบ"
        >
          <form
            onSubmit={handleCreateBrand}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
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

            <div className="md:col-span-2 xl:col-span-5 flex justify-end">
              <button
                type="submit"
                disabled={creatingBrand}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                เพิ่มยี่ห้อรถ
              </button>
            </div>
          </form>

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
    </div>
  );
}
