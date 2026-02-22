import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import {
  superadminService,
  type CreateEmployeeInput,
  type CreateInsuranceCompanyInput,
  type CreateVehicleBrandInput,
  type CreateVehicleTypeInput,
  type EmployeeItem,
  type InsuranceCompanyItem,
  type VehicleBrandItem,
  type VehicleTypeItem,
} from "../services/superadmin.service";
import {
  defaultBrandForm,
  defaultEmployeeForm,
  defaultGroupedCreateForm,
  defaultInsuranceForm,
  type DeleteTarget,
} from "../constants/manage";

function getDefaultGroupedFormWithBrand(brandId?: number) {
  return {
    ...defaultGroupedCreateForm,
    brandMode: "existing" as const,
    existingBrandId: brandId ? String(brandId) : "",
  };
}

export function useSuperAdminManage() {
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
  const [updatingEmployeePasswordId, setUpdatingEmployeePasswordId] =
    useState<number | null>(null);
  const [employeePasswordTarget, setEmployeePasswordTarget] =
    useState<EmployeeItem | null>(null);
  const [employeePassword, setEmployeePassword] = useState("");

  const [insurances, setInsurances] = useState<InsuranceCompanyItem[]>([]);
  const [insuranceForm, setInsuranceForm] =
    useState<CreateInsuranceCompanyInput>(defaultInsuranceForm);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  const [creatingInsurance, setCreatingInsurance] = useState(false);
  const [editingInsuranceId, setEditingInsuranceId] = useState<number | null>(null);
  const [insuranceEditTarget, setInsuranceEditTarget] =
    useState<InsuranceCompanyItem | null>(null);
  const [insuranceEditForm, setInsuranceEditForm] =
    useState<CreateInsuranceCompanyInput>(defaultInsuranceForm);
  const [deletingInsuranceId, setDeletingInsuranceId] = useState<number | null>(
    null,
  );

  const [brands, setBrands] = useState<VehicleBrandItem[]>([]);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [brandEditTarget, setBrandEditTarget] = useState<VehicleBrandItem | null>(
    null,
  );
  const [brandEditForm, setBrandEditForm] =
    useState<CreateVehicleBrandInput>(defaultBrandForm);
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeItem[]>([]);
  const [groupedCreateForm, setGroupedCreateForm] =
    useState(defaultGroupedCreateForm);
  const [creatingGrouped, setCreatingGrouped] = useState(false);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [employeeList, insuranceList, brandList, vehicleTypeList] =
        await Promise.all([
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

    if (!payload.name || !payload.phone || !payload.username || !payload.password) {
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
      const updated = await superadminService.updateInsurance(
        insuranceEditTarget.id,
        payload,
      );
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

      setGroupedCreateForm(getDefaultGroupedFormWithBrand(brandId));
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

  return {
    loading,
    employees,
    employeeForm,
    setEmployeeForm,
    showEmployeeForm,
    setShowEmployeeForm,
    creatingEmployee,
    deletingEmployeeId,
    updatingEmployeePasswordId,
    employeePasswordTarget,
    setEmployeePasswordTarget,
    employeePassword,
    setEmployeePassword,

    insurances,
    insuranceForm,
    setInsuranceForm,
    showInsuranceForm,
    setShowInsuranceForm,
    creatingInsurance,
    editingInsuranceId,
    insuranceEditTarget,
    insuranceEditForm,
    setInsuranceEditForm,
    deletingInsuranceId,

    brands,
    editingBrandId,
    brandEditTarget,
    brandEditForm,
    setBrandEditForm,
    deletingBrandId,
    deleteTarget,
    setDeleteTarget,

    vehicleTypes,
    groupedCreateForm,
    setGroupedCreateForm,
    creatingGrouped,

    handleCreateEmployee,
    handleUpdateEmployeePassword,
    handleCreateInsurance,
    openInsuranceEditModal,
    handleUpdateInsurance,
    openBrandEditModal,
    handleUpdateBrand,
    openDeleteModal,
    handleConfirmDelete,
    handleCreateGroupedVehicle,
    closeEmployeeForm,
    closeInsuranceForm,
    closeEmployeePasswordModal,
    closeInsuranceEditModal,
    closeBrandEditModal,
    deletingWithModal,
  };
}
