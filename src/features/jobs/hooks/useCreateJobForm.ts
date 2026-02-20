import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { JobFormData } from "../../../Type";
import type { EmployeeApi } from "../../../stations/api/employees.api";
import {
  buildYearOptions,
  parseFieldValue,
  parseInsuranceOption,
  uniqueStrings,
} from "../lib/createJobForm";
import {
  getDefaultCreateJobFormData,
  validateCreateJob,
} from "../types/jobForm";
import { jobsService } from "../services/jobs.service";
import {
  normalizeRegistration,
  vehiclesService,
  type InsuranceCompanyApi,
  type VehicleBrandApi,
  type VehicleModelApi,
} from "../services/vehicles.service";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";

export type CreateJobFormState = JobFormData & {
  insuranceCompanyId?: number | null;
  vehicleId?: number | null;
  receiverId?: number | null;
  isExistingVehicle?: boolean;
};

type SubmitSuccessHandler = () => void;

export function useCreateJobForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateJobFormState>(() => ({
    ...getDefaultCreateJobFormData(),
    vehicleId: null,
    isExistingVehicle: false,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [brandModels, setBrandModels] = useState<VehicleModelApi[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [insurances, setInsurances] = useState<InsuranceCompanyApi[]>([]);
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(false);
  const [receiverEmployee, setReceiverEmployee] = useState<EmployeeApi | null>(
    null,
  );

  const insuranceRequired = useMemo(
    () => formData.paymentType === "Insurance",
    [formData.paymentType],
  );

  const yearOptions = useMemo(() => buildYearOptions(), []);
  const brandOptions = useMemo(
    () => uniqueStrings(brands.map((b) => b.name)),
    [brands],
  );
  const insuranceOptions = useMemo(() => {
    return insurances.map((i) => `${i.id}.${i.name}`);
  }, [insurances]);

  const selectedBrand = useMemo(
    () => brands.find((b) => b.name === formData.brand) ?? null,
    [brands, formData.brand],
  );
  const selectedModel = useMemo(
    () => brandModels.find((m) => m.name === formData.model) ?? null,
    [brandModels, formData.model],
  );
  const modelOptions = useMemo(() => {
    if (!selectedBrand) return [];
    return uniqueStrings(brandModels.map((m) => m.name));
  }, [selectedBrand, brandModels]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const brandList = await vehiclesService.listBrands();
        if (!alive) return;
        setBrands(brandList);
      } catch (err) {
        console.error("โหลดข้อมูลรถไม่สำเร็จ:", err);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const typeName = selectedModel?.type?.name;
    if (!typeName) return;

    setFormData((prev) => {
      if (prev.type === typeName) return prev;
      return { ...prev, type: typeName };
    });
  }, [selectedModel?.type?.name]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!selectedBrand?.id) {
        setBrandModels([]);
        return;
      }

      try {
        setIsLoadingModels(true);
        const brandDetail = await vehiclesService.getBrandById(selectedBrand.id);
        if (!alive) return;
        setBrandModels(brandDetail.models ?? []);
      } catch (e) {
        console.error("โหลดรุ่นรถไม่สำเร็จ", e);
        if (alive) setBrandModels([]);
      } finally {
        if (alive) setIsLoadingModels(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedBrand?.id]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingInsurances(true);
        const list = await vehiclesService.listInsurances();
        if (!alive) return;
        setInsurances(list.data);
      } catch (e) {
        console.error("โหลดข้อมูลประกันไม่สำเร็จ:", e);
        if (alive) setInsurances([]);
      } finally {
        if (alive) setIsLoadingInsurances(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const lookupRegistrationAndAutofill = async () => {
    const reg = normalizeRegistration(formData.registration || "");

    if (!reg) {
      setFormData((prev) => ({
        ...prev,
        vehicleId: null,
        isExistingVehicle: false,
      }));
      return;
    }

    try {
      const found = await vehiclesService.findVehicleByReg(reg);

      if (!found) {
        setFormData((prev) => ({
          ...prev,
          vehicleId: null,
          isExistingVehicle: false,
        }));
        return;
      }
      const latestJob = await jobsService.findLatestByRegistration(reg);

      setFormData((prev) => ({
        ...prev,
        vehicleId: found.id,
        isExistingVehicle: true,
        chassisNumber: found.chassisNumber ?? prev.chassisNumber,
        brand: found.brand ?? prev.brand,
        model: found.model ?? prev.model,
        type: found.type ?? prev.type,
        year: found.year ?? prev.year,
        color: found.color ?? prev.color,
        customerName:
          found.customer?.name ?? latestJob?.customer?.name ?? prev.customerName,
        customerPhone:
          found.customer?.phone ??
          latestJob?.customer?.phone ??
          prev.customerPhone,
        customerAddress:
          found.customer?.address ??
          latestJob?.customer?.address ??
          prev.customerAddress,
      }));
    } catch (err) {
      console.error("ค้นหาทะเบียนรถไม่สำเร็จ:", err);
      setFormData((prev) => ({
        ...prev,
        vehicleId: null,
        isExistingVehicle: false,
      }));
    }
  };

  const handleReceiverChange = (emp: EmployeeApi | null) => {
    setReceiverEmployee(emp);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.receiver;
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      receiverId: emp?.id ?? null,
      receiver: emp?.name ?? "",
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "customerPhone") {
      let digits = value.replace(/\D/g, "");
      digits = digits.slice(0, 10);
      if (digits.length > 0 && digits[0] !== "0") return;

      setFormData((prev) => ({ ...prev, customerPhone: digits }));
      return;
    }

    if (name === "registration") {
      setFormData((prev) => ({
        ...prev,
        registration: value,
        vehicleId: null,
        isExistingVehicle: false,
      }));
      return;
    }

    if (name === "brand") {
      setFormData((prev) => ({ ...prev, brand: value, model: "", type: "" }));
      return;
    }

    if (name === "model") {
      const nextTypeName =
        brandModels.find((m) => m.name === value)?.type?.name ?? "";
      setFormData((prev) => ({
        ...prev,
        model: value,
        type: nextTypeName || prev.type,
      }));
      return;
    }

    if (name === "insuranceCompanyId") {
      const { id, name: companyName } = parseInsuranceOption(value);
      setFormData((prev) => ({
        ...prev,
        insuranceCompanyId: Number.isFinite(id) ? id : null,
        insuranceCompany: companyName || "",
      }));
      return;
    }

    if (name === "paymentType") {
      const next = value as "Insurance" | "Cash";
      setFormData((prev) => ({
        ...prev,
        paymentType: next,
        ...(next === "Insurance"
          ? {}
          : { insuranceCompanyId: null, insuranceCompany: "", claimAmount: 0 }),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: parseFieldValue(name, value) }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSuccess: SubmitSuccessHandler,
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    const v = validateCreateJob(formData);
    if (!v.ok) {
      const fieldErrors: Record<string, string> = {};
      v.errors.forEach((err) => {
        fieldErrors[err.field] = err.message;
      });
      setErrors(fieldErrors);

      const firstKey = Object.keys(fieldErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const basePayload = {
      receiver: formData.receiver || "",
      receiverId: formData.receiverId ?? null,
      paymentType: formData.paymentType,
      repairDescription: formData.repairDescription?.trim() || "",
      excessFee: formData.excessFee,
      claimAmount:
        formData.paymentType === "Insurance" ? Number(formData.claimAmount) || 0 : 0,
      notes: formData.notes?.trim() ? formData.notes.trim() : null,
      // Backend currently rejects null for startDate, so default to "now" when left blank.
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      estimatedEndDate: formData.estimatedEndDate
        ? new Date(formData.estimatedEndDate).toISOString()
        : null,
      customer: {
        name: formData.customerName || "",
        phone: formData.customerPhone || "",
        address: formData.customerAddress || "",
      },
    };
    const vehiclePart = formData.vehicleId
      ? { vehicleId: formData.vehicleId }
      : {
          vehicle: {
            registration: formData.registration,
            brand: formData.brand,
            model: formData.model,
            type: formData.type,
            color: formData.color,
            chassisNumber: formData.chassisNumber,
            year: formData.year,
          },
        };

    const payload =
      formData.paymentType === "Insurance" && formData.insuranceCompanyId
        ? {
            ...basePayload,
            ...vehiclePart,
            insuranceCompanyId: formData.insuranceCompanyId,
          }
        : { ...basePayload, ...vehiclePart };

    try {
      setIsSubmitting(true);
      const res = await jobsService.create(payload);
      if (!res.ok) {
        toast.error(toThaiErrorMessage(res.error, "บันทึกข้อมูลไม่สำเร็จ"));
        return;
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    insuranceRequired,
    isLoadingModels,
    isLoadingInsurances,
    brandOptions,
    modelOptions,
    yearOptions,
    insuranceOptions,
    receiverEmployee,
    handleChange,
    handleReceiverChange,
    lookupRegistrationAndAutofill,
    handleSubmit,
  };
}
