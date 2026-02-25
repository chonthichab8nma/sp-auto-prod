import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import {
  superadminService,
  type AlertConfigItem,
  type AlertConfigStatus,
  type CreateEmployeeInput,
  type CreateInsuranceCompanyInput,
  type CreateVehicleBrandInput,
  type CreateVehicleTypeInput,
  type EmployeeItem,
  type InsuranceCompanyItem,
  type UpsertVehicleBrandInput,
  type UpdateAlertConfigInput,
  type UpdateEmployeeInput,
  type VehicleBrandItem,
  type VehicleModelItem,
  type VehicleTypeItem,
} from "../services/superadmin.service";
import {
  defaultBrandForm,
  defaultEmployeeForm,
  defaultGroupedCreateForm,
  defaultInsuranceForm,
  type DeleteTarget,
} from "../constants/manage";

const ALERT_STATUS_ORDER: AlertConfigStatus[] = [
  "CLAIM",
  "REPAIR",
  "BILLING",
];

function getDefaultGroupedFormWithBrand(brandId?: number) {
  return {
    ...defaultGroupedCreateForm,
    brandMode: "existing" as const,
    existingBrandId: brandId ? String(brandId) : "",
  };
}

function sortAlertConfigs(items: AlertConfigItem[]) {
  return [...items].sort(
    (a, b) => ALERT_STATUS_ORDER.indexOf(a.status) - ALERT_STATUS_ORDER.indexOf(b.status),
  );
}

function withDefaultAlertConfigs(items: AlertConfigItem[]) {
  const byStatus = new Map(items.map((item) => [item.status, item]));
  return ALERT_STATUS_ORDER.map((status) => {
    const found = byStatus.get(status);
    if (found) return found;
    return {
      id: 0,
      status,
      warningDays: 0,
      criticalDays: 0,
      updatedAt: new Date().toISOString(),
    };
  });
}

function splitModelNames(input: string): string[] {
  const uniqueByLower = new Set<string>();
  const models: string[] = [];
  const tokens = input.split(/\r?\n|,/g);

  for (const token of tokens) {
    const name = token.trim();
    if (!name) continue;
    const normalized = name.toLowerCase();
    if (uniqueByLower.has(normalized)) continue;
    uniqueByLower.add(normalized);
    models.push(name);
  }

  return models;
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
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [employeeEditTarget, setEmployeeEditTarget] =
    useState<EmployeeItem | null>(null);
  const [employeeEditForm, setEmployeeEditForm] = useState<UpdateEmployeeInput>({
    name: "",
    role: "staff",
    phone: "",
    username: "",
    password: "",
  });
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

  const [alertConfigs, setAlertConfigs] = useState<AlertConfigItem[]>([]);
  const [editingAlertConfigId, setEditingAlertConfigId] = useState<number | null>(null);
  const [alertConfigEditTarget, setAlertConfigEditTarget] =
    useState<AlertConfigItem | null>(null);
  const [alertConfigEditForm, setAlertConfigEditForm] =
    useState<UpdateAlertConfigInput>({
      warningDays: 0,
      criticalDays: 0,
    });

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
  const [selectedModelsBrandId, setSelectedModelsBrandId] = useState("");
  const [modelsByBrand, setModelsByBrand] = useState<VehicleModelItem[]>([]);
  const [loadingModelsByBrand, setLoadingModelsByBrand] = useState(false);
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [deletingModelId, setDeletingModelId] = useState<number | null>(null);
  const [deletingTypeId, setDeletingTypeId] = useState<number | null>(null);
  const [modelEditTarget, setModelEditTarget] = useState<VehicleModelItem | null>(null);
  const [modelEditForm, setModelEditForm] = useState({
    name: "",
    typeId: "",
  });

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [employeeList, insuranceList, alertConfigList, brandList, vehicleTypeList] =
        await Promise.all([
          superadminService.listEmployees(),
          superadminService.listInsurances(),
          superadminService.listAlertConfigs(),
          superadminService.listVehicleBrands(),
          superadminService.listVehicleTypes(),
        ]);

      setEmployees(employeeList);
      setInsurances(insuranceList);
      setAlertConfigs(withDefaultAlertConfigs(sortAlertConfigs(alertConfigList)));
      setBrands(brandList);
      setVehicleTypes(vehicleTypeList);
      if (brandList.length > 0) {
        const firstBrandId = brandList[0].id;
        setSelectedModelsBrandId(String(firstBrandId));
        await loadModelsForBrand(firstBrandId);
      } else {
        setSelectedModelsBrandId("");
        setModelsByBrand([]);
      }
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "โหลดข้อมูลจัดการระบบไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }

  async function loadModelsForBrand(brandId: number) {
    if (!brandId) {
      setModelsByBrand([]);
      return;
    }

    try {
      setLoadingModelsByBrand(true);
      const list = await superadminService.listVehicleModelsByBrand(brandId);
      setModelsByBrand(list);
    } catch (e) {
      setModelsByBrand([]);
      toast.error(toThaiErrorMessage(e, "โหลดรุ่นรถไม่สำเร็จ"));
    } finally {
      setLoadingModelsByBrand(false);
    }
  }

  useEffect(() => {
    const brandId = Number(selectedModelsBrandId);
    if (!brandId) {
      setModelsByBrand([]);
      return;
    }
    void loadModelsForBrand(brandId);
  }, [selectedModelsBrandId]);

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

  function openEmployeeEditModal(item: EmployeeItem) {
    setEmployeeEditTarget(item);
    setEmployeeEditForm({
      name: item.name ?? "",
      role: item.role ?? "staff",
      phone: item.phone ?? "",
      username: item.username ?? "",
      password: "",
    });
  }

  async function handleUpdateEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeEditTarget || editingEmployeeId) return;

    const nextPassword = (employeeEditForm.password ?? "").trim();
    const payload: UpdateEmployeeInput = {
      name: employeeEditForm.name.trim(),
      role: employeeEditForm.role,
      phone: employeeEditForm.phone.replace(/\D/g, "").slice(0, 10),
      username: employeeEditForm.username.trim(),
      isActive: employeeEditTarget.isActive ?? true,
      ...(nextPassword ? { password: nextPassword } : {}),
    };

    if (!payload.name || !payload.phone || !payload.username) {
      toast.error("กรุณากรอกข้อมูลพนักงานให้ครบ");
      return;
    }

    if (!payload.phone.startsWith("0")) {
      toast.error("เบอร์โทรพนักงานต้องขึ้นต้นด้วย 0");
      return;
    }

    try {
      setEditingEmployeeId(employeeEditTarget.id);
      const updated = await superadminService.updateEmployee(employeeEditTarget.id, payload);
      setEmployees((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setEmployeeEditTarget(null);
      setEmployeeEditForm({
        name: "",
        role: "staff",
        phone: "",
        username: "",
        password: "",
      });
      toast.success("แก้ไขข้อมูลพนักงานสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "แก้ไขข้อมูลพนักงานไม่สำเร็จ"));
    } finally {
      setEditingEmployeeId(null);
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

  function openAlertConfigEditModal(item: AlertConfigItem) {
    if (item.status === "DONE") {
      toast("สถานะ DONE ไม่ต้องแจ้งเตือน");
      return;
    }

    setAlertConfigEditTarget(item);
    setAlertConfigEditForm({
      warningDays: Number(item.warningDays || 0),
      criticalDays: Number(item.criticalDays || 0),
    });
  }

  async function handleUpdateAlertConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!alertConfigEditTarget || editingAlertConfigId) return;

    const warningDays = Number(alertConfigEditForm.warningDays);
    const criticalDays = Number(alertConfigEditForm.criticalDays);

    if (!Number.isFinite(warningDays) || !Number.isFinite(criticalDays)) {
      toast.error("กรุณากรอกเป็นตัวเลขเท่านั้น");
      return;
    }

    if (warningDays < 0 || criticalDays < 0) {
      toast.error("จำนวนวันต้องไม่ติดลบ");
      return;
    }

    if (criticalDays < warningDays) {
      toast.error("Critical Days ต้องมากกว่าหรือเท่ากับ Warning Days");
      return;
    }

    try {
      setEditingAlertConfigId(alertConfigEditTarget.id);
      const updated = await superadminService.updateAlertConfig(alertConfigEditTarget.status, {
        warningDays,
        criticalDays,
      });

      setAlertConfigs((prev) =>
        withDefaultAlertConfigs(
          sortAlertConfigs(
            prev.map((item) =>
              item.status === alertConfigEditTarget.status
                ? {
                    ...item,
                    ...updated,
                    warningDays,
                    criticalDays,
                    updatedAt: updated.updatedAt || new Date().toISOString(),
                  }
                : item,
            ),
          ),
        ),
      );

      setAlertConfigEditTarget(null);
      setAlertConfigEditForm({ warningDays: 0, criticalDays: 0 });
      toast.success("บันทึก SLA สำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "บันทึก SLA ไม่สำเร็จ"));
    } finally {
      setEditingAlertConfigId(null);
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

    const normalizedName = brandEditForm.name.trim();
    const payload: UpsertVehicleBrandInput = {
      code: brandEditForm.code.trim().toLowerCase(),
      name: normalizedName,
      nameEn: brandEditForm.nameEn.trim() || normalizedName,
      country: brandEditForm.country.trim() || "-",
      logoUrl: brandEditForm.logoUrl.trim() || undefined,
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
        if (Number(selectedModelsBrandId) === deleteTarget.id) {
          setSelectedModelsBrandId("");
          setModelsByBrand([]);
        }
        toast.success("ลบยี่ห้อรถแล้ว");
      }

      if (deleteTarget.type === "model") {
        setDeletingModelId(deleteTarget.id);
        await superadminService.deleteVehicleModel(deleteTarget.id);
        setModelsByBrand((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        if (Number(selectedModelsBrandId) === deleteTarget.brandId) {
          await loadModelsForBrand(deleteTarget.brandId);
        }
        toast.success("ลบรุ่นรถแล้ว");
      }

      if (deleteTarget.type === "type") {
        setDeletingTypeId(deleteTarget.id);
        await superadminService.deleteVehicleType(deleteTarget.id);
        setVehicleTypes((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        toast.success("ลบประเภทรถแล้ว");
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
      if (deleteTarget.type === "model") {
        toast.error(toThaiErrorMessage(e, "ลบรุ่นรถไม่สำเร็จ"));
      }
      if (deleteTarget.type === "type") {
        toast.error(toThaiErrorMessage(e, "ลบประเภทรถไม่สำเร็จ"));
      }
    } finally {
      setDeletingEmployeeId(null);
      setDeletingInsuranceId(null);
      setDeletingBrandId(null);
      setDeletingModelId(null);
      setDeletingTypeId(null);
    }
  }

  async function handleCreateGroupedVehicle(e: React.FormEvent): Promise<boolean> {
    e.preventDefault();
    if (creatingGrouped) return false;

    const modelNames = splitModelNames(groupedCreateForm.modelNamesText);
    if (modelNames.length === 0) {
      toast.error("กรุณากรอกชื่อรุ่นรถอย่างน้อย 1 รุ่น");
      return false;
    }

    if (groupedCreateForm.brandMode === "existing") {
      if (!Number(groupedCreateForm.existingBrandId)) {
        toast.error("กรุณาเลือกยี่ห้อรถ");
        return false;
      }
    } else {
      const brandCode = groupedCreateForm.brandCode.trim().toLowerCase();
      const brandName = groupedCreateForm.brandName.trim();
      if (!brandCode || !brandName) {
        toast.error("กรุณากรอกรหัสและชื่อยี่ห้อรถ");
        return false;
      }
    }

    if (groupedCreateForm.typeMode === "existing") {
      if (!Number(groupedCreateForm.existingTypeId)) {
        toast.error("กรุณาเลือกประเภทรถ");
        return false;
      }
    } else {
      const typeCode = groupedCreateForm.typeCode.trim().toLowerCase();
      const typeName = groupedCreateForm.typeName.trim();
      if (!typeCode || !typeName) {
        toast.error("กรุณากรอกรหัสและชื่อประเภทรถ");
        return false;
      }
    }

    let createdBrandId: number | null = null;
    let createdTypeId: number | null = null;

    try {
      setCreatingGrouped(true);

      let brandId: number;
      if (groupedCreateForm.brandMode === "existing") {
        brandId = Number(groupedCreateForm.existingBrandId);
      } else {
        const normalizedBrandCode = groupedCreateForm.brandCode.trim().toLowerCase();
        const existingBrandByCode = brands.find(
          (item) => item.code.trim().toLowerCase() === normalizedBrandCode,
        );
        if (existingBrandByCode) {
          brandId = existingBrandByCode.id;
          toast("พบรหัสยี่ห้อเดิม ระบบจะใช้ยี่ห้อเดิมให้อัตโนมัติ");
        } else {
          const normalizedBrandName = groupedCreateForm.brandName.trim();
          const brandPayload: UpsertVehicleBrandInput = {
            code: normalizedBrandCode,
            name: normalizedBrandName,
            nameEn: groupedCreateForm.brandNameEn.trim() || normalizedBrandName,
            country: groupedCreateForm.brandCountry.trim() || "-",
            logoUrl: groupedCreateForm.brandLogoUrl.trim() || undefined,
          };
          const createdBrand = await superadminService.createVehicleBrand(brandPayload);
          setBrands((prev) => [createdBrand, ...prev]);
          brandId = createdBrand.id;
          createdBrandId = createdBrand.id;
        }
      }

      let typeId: number;
      if (groupedCreateForm.typeMode === "existing") {
        typeId = Number(groupedCreateForm.existingTypeId);
      } else {
        const normalizedTypeCode = groupedCreateForm.typeCode.trim().toLowerCase();
        const existingTypeByCode = vehicleTypes.find(
          (item) => item.code.trim().toLowerCase() === normalizedTypeCode,
        );
        if (existingTypeByCode) {
          typeId = existingTypeByCode.id;
          toast("พบรหัสประเภทรถเดิม ระบบจะใช้ประเภทเดิมให้อัตโนมัติ");
        } else {
          const typePayload: CreateVehicleTypeInput = {
            code: normalizedTypeCode,
            name: groupedCreateForm.typeName.trim(),
            nameEn: groupedCreateForm.typeNameEn.trim(),
          };
          const createdType = await superadminService.createVehicleType(typePayload);
          setVehicleTypes((prev) => [createdType, ...prev]);
          typeId = createdType.id;
          createdTypeId = createdType.id;
        }
      }

      await Promise.all(
        modelNames.map((modelName) =>
          superadminService.createVehicleModel({
            brandId,
            name: modelName,
            typeId,
          }),
        ),
      );

      setGroupedCreateForm(getDefaultGroupedFormWithBrand(brandId));
      setSelectedModelsBrandId(String(brandId));
      await loadModelsForBrand(brandId);
      toast.success(`เพิ่มข้อมูลรถสำเร็จ ${modelNames.length} รุ่น`);
      return true;
    } catch (e) {
      if (createdBrandId) {
        try {
          await superadminService.deleteVehicleBrand(createdBrandId);
          setBrands((prev) => prev.filter((item) => item.id !== createdBrandId));
        } catch {
          // ignore rollback error
        }
      }
      if (createdTypeId) {
        try {
          await superadminService.deleteVehicleType(createdTypeId);
          setVehicleTypes((prev) => prev.filter((item) => item.id !== createdTypeId));
        } catch {
          // ignore rollback error
        }
      }
      toast.error(toThaiErrorMessage(e, "เพิ่มข้อมูลรถไม่สำเร็จ"));
      return false;
    } finally {
      setCreatingGrouped(false);
    }
  }

  function openModelEditModal(item: VehicleModelItem) {
    setModelEditTarget(item);
    setModelEditForm({
      name: item.name ?? "",
      typeId: item.typeId ? String(item.typeId) : "",
    });
  }

  async function handleUpdateVehicleModel(e: React.FormEvent) {
    e.preventDefault();
    if (!modelEditTarget || editingModelId) return;

    const payload = {
      name: modelEditForm.name.trim(),
      typeId: Number(modelEditForm.typeId) || null,
    };

    if (!payload.name) {
      toast.error("กรุณากรอกชื่อรุ่นรถ");
      return;
    }

    if (!payload.typeId) {
      toast.error("กรุณาเลือกประเภทรถ");
      return;
    }

    try {
      setEditingModelId(modelEditTarget.id);
      await superadminService.updateVehicleModel(modelEditTarget.id, payload);
      const selectedBrandId = Number(selectedModelsBrandId);
      if (selectedBrandId) {
        await loadModelsForBrand(selectedBrandId);
      }
      setModelEditTarget(null);
      setModelEditForm({ name: "", typeId: "" });
      toast.success("แก้ไขรุ่นรถสำเร็จ");
    } catch (e) {
      toast.error(toThaiErrorMessage(e, "แก้ไขรุ่นรถไม่สำเร็จ"));
    } finally {
      setEditingModelId(null);
    }
  }

  function closeEmployeeForm() {
    if (creatingEmployee) return;
    setEmployeeForm(defaultEmployeeForm);
    setShowEmployeeForm(false);
  }

  function closeEmployeeEditModal() {
    if (editingEmployeeId) return;
    setEmployeeEditTarget(null);
    setEmployeeEditForm({
      name: "",
      role: "staff",
      phone: "",
      username: "",
      password: "",
    });
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

  function closeAlertConfigEditModal() {
    if (editingAlertConfigId) return;
    setAlertConfigEditTarget(null);
    setAlertConfigEditForm({ warningDays: 0, criticalDays: 0 });
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

  function closeModelEditModal() {
    if (editingModelId) return;
    setModelEditTarget(null);
    setModelEditForm({ name: "", typeId: "" });
  }

  const deletingWithModal =
    deleteTarget?.type === "employee"
      ? deletingEmployeeId === deleteTarget.id
      : deleteTarget?.type === "insurance"
        ? deletingInsuranceId === deleteTarget.id
        : deleteTarget?.type === "brand"
          ? deletingBrandId === deleteTarget.id
          : deleteTarget?.type === "model"
            ? deletingModelId === deleteTarget.id
            : deleteTarget?.type === "type"
              ? deletingTypeId === deleteTarget.id
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
    editingEmployeeId,
    employeeEditTarget,
    setEmployeeEditTarget,
    employeeEditForm,
    setEmployeeEditForm,
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

    alertConfigs,
    editingAlertConfigId,
    alertConfigEditTarget,
    setAlertConfigEditTarget,
    alertConfigEditForm,
    setAlertConfigEditForm,

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
    selectedModelsBrandId,
    setSelectedModelsBrandId,
    modelsByBrand,
    loadingModelsByBrand,
    editingModelId,
    deletingModelId,
    deletingTypeId,
    modelEditTarget,
    setModelEditForm,
    modelEditForm,

    handleCreateEmployee,
    openEmployeeEditModal,
    handleUpdateEmployee,
    handleUpdateEmployeePassword,
    openAlertConfigEditModal,
    handleUpdateAlertConfig,
    handleCreateInsurance,
    openInsuranceEditModal,
    handleUpdateInsurance,
    openBrandEditModal,
    handleUpdateBrand,
    openDeleteModal,
    handleConfirmDelete,
    handleCreateGroupedVehicle,
    openModelEditModal,
    handleUpdateVehicleModel,
    closeEmployeeForm,
    closeEmployeeEditModal,
    closeInsuranceForm,
    closeEmployeePasswordModal,
    closeAlertConfigEditModal,
    closeInsuranceEditModal,
    closeBrandEditModal,
    closeModelEditModal,
    deletingWithModal,
  };
}
