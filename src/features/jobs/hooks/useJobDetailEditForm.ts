import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";

import type { EmployeeApi } from "../../../stations/api/employees.api";
import { jobsService } from "../services/jobs.service";
import {
  vehiclesService,
  type VehicleBrandApi,
  type VehicleModelApi,
  type InsuranceCompanyApi,
} from "../services/vehicles.service";
import {
  buildJobUpdatePayload,
  mapJobToDetailEditForm,
  validateJobDetailEdit,
  type JobDetailEditForm,
} from "../types/jobDetailEdit";
import type { JobApi } from "../api/job.api";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";

export function useJobDetailEditForm(
  job: JobApi | null,
  onSaved?: (savedForm: JobDetailEditForm) => void,
) {
  const toReceiverEmployee = (target: JobApi | null): EmployeeApi | null => {
    if (!target?.receiverId || !target.receiver?.name) return null;
    return {
      id: target.receiverId,
      name: target.receiver.name,
      role: "",
      phone: "",
      isActive: true,
      username: "",
    };
  };

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JobDetailEditForm, string>>>({});
  const [form, setForm] = useState<JobDetailEditForm | null>(
    job ? mapJobToDetailEditForm(job) : null,
  );

  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [brandModels, setBrandModels] = useState<VehicleModelApi[]>([]);
  const [insurances, setInsurances] = useState<InsuranceCompanyApi[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [receiverEmployee, setReceiverEmployee] = useState<EmployeeApi | null>(
    toReceiverEmployee(job),
  );

  useEffect(() => {
    if (!job || editing) return;
    setForm(mapJobToDetailEditForm(job));
    setReceiverEmployee(toReceiverEmployee(job));
  }, [editing, job]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [brandList, insuranceList] = await Promise.all([
          vehiclesService.listBrands(),
          vehiclesService.listInsurances(),
        ]);
        if (!alive) return;
        setBrands(brandList);
        setInsurances(insuranceList.data ?? []);
      } catch {
        if (!alive) return;
        setBrands([]);
        setInsurances([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!form?.brand) {
        setBrandModels([]);
        return;
      }

      const selectedBrand = brands.find((b) => b.name === form.brand);
      if (!selectedBrand?.id) {
        setBrandModels([]);
        return;
      }

      try {
        setIsLoadingModels(true);
        const detail = await vehiclesService.getBrandById(selectedBrand.id);
        if (!alive) return;
        setBrandModels(detail.models ?? []);
      } catch {
        if (!alive) return;
        setBrandModels([]);
      } finally {
        if (alive) setIsLoadingModels(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brands, form?.brand]);

  const brandOptions = useMemo(
    () => Array.from(new Set(brands.map((b) => b.name).filter(Boolean))),
    [brands],
  );
  const modelOptions = useMemo(
    () => Array.from(new Set(brandModels.map((m) => m.name).filter(Boolean))),
    [brandModels],
  );
  const insuranceOptions = useMemo(
    () => insurances.map((i) => `${i.id}::${i.name}`),
    [insurances],
  );
  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const years: string[] = [];
    for (let y = now; y >= now - 40; y--) years.push(String(y));
    return years;
  }, []);

  const onChangeField = (
    name: keyof JobDetailEditForm,
    value: string | number | null,
  ) => {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value } as JobDetailEditForm;
    });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!form) return;

    if (name === "insuranceCompanyId") {
      const [id] = value.split("::");
      onChangeField("insuranceCompanyId", id ? Number(id) : null);
      return;
    }

    if (name === "paymentType") {
      const next = value === "Insurance" ? "Insurance" : "Cash";
      onChangeField("paymentType", next);
      if (next === "Cash") {
        onChangeField("insuranceCompanyId", null);
      }
      return;
    }

    if (name === "excessFee") {
      onChangeField("excessFee", value === "" ? 0 : Number(value));
      return;
    }

    if (name === "brand") {
      onChangeField("brand", value);
      onChangeField("model", "");
      const selected = brands.find((b) => b.name === value);
      const firstType = selected?.models?.[0]?.type?.name ?? "";
      onChangeField("type", firstType);
      return;
    }

    if (name === "model") {
      onChangeField("model", value);
      const selectedModel = brandModels.find((m) => m.name === value);
      if (selectedModel?.type?.name) {
        onChangeField("type", selectedModel.type.name);
      }
      return;
    }

    if (name === "customerPhone") {
      let digits = value.replace(/\D/g, "").slice(0, 10);
      if (digits.length > 0 && digits[0] !== "0") return;
      onChangeField("customerPhone", digits);
      return;
    }

    onChangeField(name as keyof JobDetailEditForm, value);
  };

  const onChangeEmployee = (emp: EmployeeApi | null) => {
    setReceiverEmployee(emp);
    onChangeField("receiverId", emp?.id ?? null);
    onChangeField("receiverName", emp?.name ?? "");
  };

  const startEdit = () => {
    if (!job) return;
    setForm(mapJobToDetailEditForm(job));
    setReceiverEmployee(toReceiverEmployee(job));
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    if (!job) return;
    setForm(mapJobToDetailEditForm(job));
    setReceiverEmployee(toReceiverEmployee(job));
    setErrors({});
    setEditing(false);
  };

  const submit = async () => {
    if (!job || !form) return;
    const v = validateJobDetailEdit(form);
    if (!v.ok) {
      setErrors(v.errors);
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setSaving(true);
      const payload = buildJobUpdatePayload(job, form);
      const res = await jobsService.update(job.id, payload);
      if (!res.ok) {
        toast.error(toThaiErrorMessage(res.error, "บันทึกข้อมูลไม่สำเร็จ"));
        return;
      }

      toast.success("บันทึกข้อมูลเรียบร้อย");
      setEditing(false);
      onSaved?.(form);
    } finally {
      setSaving(false);
    }
  };

  return {
    editing,
    saving,
    errors,
    form,
    brandOptions,
    modelOptions,
    yearOptions,
    insuranceOptions,
    isLoadingModels,
    receiverEmployee,
    handleInputChange,
    onChangeField,
    onChangeEmployee,
    startEdit,
    cancelEdit,
    submit,
  };
}
