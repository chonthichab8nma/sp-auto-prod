export type StepStatus = "pending" | "in_progress" | "completed" | "skipped";
export type PaymentType = "Insurance" | "Cash";

export interface Step {
  id: string;
  name: string;
  status: StepStatus;
  timestamp?: string;
  employee?: string;
}

export interface Stage {
  id: "claim" | "repair" | "billing";
  name: string;
  steps: Step[];
  isLocked: boolean;
  isCompleted: boolean;
}

export interface JobFormData {
  registration: string;
  chassisNumber: string;
  brand: string;
  type: string;
  model: string;
  year: string;
  color: string;
  startDate: string;
  estimatedEndDate: string;
  excessFee: number;
  receiver: string;
  paymentType: PaymentType;
  insuranceCompany?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
   insuranceCompanyId?: number | null,
}



export interface Job extends JobFormData {
  id: string;
  stages: Stage[];
  currentStageIndex: number;
  isFinished: boolean;
}

