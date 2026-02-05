import type React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import type { JobApi, VehicleApi, CustomerApi } from "../api/job.api";

import StationsTable from "./JobsTable";

vi.mock("../../../shared/components/ui/StatusBadge", () => ({
  default: ({ job }: { job: JobApi }) => <div>STATUS-{job.id}</div>,
}));

vi.mock("../../../shared/components/ui/Skeleton", () => ({
  default: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="skeleton" {...props} />
  ),
}));

vi.mock("../../../shared/lib/date", () => ({
  formatThaiDate: (v: string) => `DATE:${v}`,
}));

const makeVehicle = (overrides: Partial<VehicleApi> = {}): VehicleApi =>
  ({
    id: 1,
    customerId: 1,
    registration: "-",
    vinNumber: null,
    brand: "-",
    model: "-",
    type: "-",
    ...overrides,
  }) as VehicleApi;

const makeJob = (overrides: Partial<JobApi> = {}): JobApi =>
  ({
    id: 0,
    vehicle: makeVehicle(),
    customer: undefined,
    startDate: "2026-02-01",
    estimatedEndDate: "2026-02-05",
    ...overrides,
  }) as JobApi;

const makeCustomer = (overrides: Partial<CustomerApi> = {}): CustomerApi =>
  ({
    id: 1,
    name: "-",
    phone: "-",
    ...overrides,
  }) as CustomerApi;

describe("StationsTable", () => {
  it("render table header", () => {
    render(<StationsTable jobs={[]} loading={false} onRowClick={() => {}} />);

    expect(screen.getByText("ทะเบียนรถ")).toBeInTheDocument();
    expect(screen.getByText("ชื่อ-นามสกุล")).toBeInTheDocument();
    expect(screen.getByText("เบอร์โทรศัพท์")).toBeInTheDocument();
    expect(screen.getByText("ยี่ห้อ/รุ่น (ประเภท)")).toBeInTheDocument();
    expect(screen.getByText("สถานะ")).toBeInTheDocument();
    expect(screen.getByText("วันที่นำรถเข้าจอดซ่อม")).toBeInTheDocument();
    expect(screen.getByText("วันที่นัดรับรถ")).toBeInTheDocument();
  });

  it("shows loading skeleton rows when loading=true", () => {
    render(<StationsTable jobs={[]} loading={true} onRowClick={() => {}} />);

    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThanOrEqual(42);
    expect(screen.queryByText("ไม่มีข้อมูล")).not.toBeInTheDocument();
  });

  it("shows empty state when not loading and jobs is empty", () => {
    render(<StationsTable jobs={[]} loading={false} onRowClick={() => {}} />);
    expect(screen.getByText("ไม่มีข้อมูล")).toBeInTheDocument();
  });

  it("renders rows with job data", () => {
    const jobs: JobApi[] = [
      makeJob({
        id: 10,
        vehicle: makeVehicle({
          registration: "กข-1234",
          brand: "Toyota",
          model: "Vios",
        }),
        customer: makeCustomer({
          name: "Jane",
          phone: "0900000000",
        }),
      }),
    ];

    render(<StationsTable jobs={jobs} loading={false} onRowClick={() => {}} />);

    expect(screen.getByText("กข-1234")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("0900000000")).toBeInTheDocument();
    expect(screen.getByText("Toyota Vios")).toBeInTheDocument();

    expect(screen.getByText("DATE:2026-02-01")).toBeInTheDocument();
    expect(screen.getByText("DATE:2026-02-05")).toBeInTheDocument();

    expect(screen.getByText("STATUS-10")).toBeInTheDocument();
  });

  it("renders '-' when customer is missing", () => {
    const jobs: JobApi[] = [
      makeJob({
        id: 11,
        vehicle: makeVehicle({
          registration: "ขค-9999",
          brand: "Honda",
          model: "City",
        }),
        customer: undefined,
      }),
    ];

    render(<StationsTable jobs={jobs} loading={false} onRowClick={() => {}} />);

    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTitle("-")).toBeInTheDocument();
  });

  it("calls onRowClick when click a row", () => {
    const onRowClick = vi.fn<(id: number) => void>();

    const jobs: JobApi[] = [
      makeJob({
        id: 20,
        vehicle: makeVehicle({
          registration: "งจ-2222",
          brand: "Mazda",
          model: "2",
        }),
        customer: makeCustomer({
          name: "Jane",
          phone: "0900000000",
        }),
      }),
    ];

    render(
      <StationsTable jobs={jobs} loading={false} onRowClick={onRowClick} />,
    );

    fireEvent.click(screen.getByText("งจ-2222"));
    expect(onRowClick).toHaveBeenCalledWith(20);
  });

  it("does NOT call onRowClick when click action button in row", () => {
    const onRowClick = vi.fn<(id: number) => void>();

    const jobs: JobApi[] = [
      makeJob({
        id: 21,
        vehicle: makeVehicle({
          registration: "ทท-3333",
          brand: "Nissan",
          model: "Almera",
        }),
        customer: makeCustomer({
          name: "Jane",
          phone: "0900000000",
        }),
      }),
    ];

    const { container } = render(
      <StationsTable jobs={jobs} loading={false} onRowClick={onRowClick} />,
    );

    const btn = container.querySelector("tbody button");
    expect(btn).toBeTruthy();

    fireEvent.click(btn!);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
