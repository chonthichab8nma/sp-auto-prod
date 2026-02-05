import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardStats from "./DashboardStats";


describe("DashboardStatts", () => {
  const values = {
    total: 10,
    claim: 2,
    repair: 3,
    billing: 4,
    finished: 1,
  };
  it("render all cards with labels and value", () => {
    render(
      <DashboardStats
        selectedStatus="ทั้งหมด"
        onSelectStatus={() => {}}
        values={values}
      />,
    );

    expect(screen.getByText("รถทั้งหมด")).toBeInTheDocument();
    expect(screen.getByText("ขั้นตอนเคลม")).toBeInTheDocument();
    expect(screen.getByText("ขั้นตอนซ่อม")).toBeInTheDocument();
    expect(screen.getByText("ขั้นตอนตั้งเบิก")).toBeInTheDocument();
    expect(screen.getByText("รถที่เสร็จสิ้น")).toBeInTheDocument();

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

//เมื่อผู้ใช้คลิก card ไหน ต้องเรียก onSelectStatus ด้วยค่าที่ถูกต้อง
  it("calls onSelectStatus with correct statusValue when a card is clicked", () => {
    const onSelectStatus = vi.fn();

    render(
      <DashboardStats
        selectedStatus="ทั้งหมด"
        onSelectStatus={onSelectStatus}
        values={values}
      />,
    );

    fireEvent.click(screen.getByText("ขั้นตอนเคลม"));
    expect(onSelectStatus).toHaveBeenCalledWith("เคลม");

    fireEvent.click(screen.getByText("ขั้นตอนซ่อม"));
    expect(onSelectStatus).toHaveBeenCalledWith("ซ่อม");

    fireEvent.click(screen.getByText("ขั้นตอนตั้งเบิก"));
    expect(onSelectStatus).toHaveBeenCalledWith("ตั้งเบิก");

    fireEvent.click(screen.getByText("รถที่เสร็จสิ้น"));
    expect(onSelectStatus).toHaveBeenCalledWith("เสร็จสิ้น");

    fireEvent.click(screen.getByText("รถทั้งหมด"));
    expect(onSelectStatus).toHaveBeenCalledWith("ทั้งหมด");
  });

// card ที่ตรงกับ selectedStatus ต้องแสดงเป็น active
  it("applies active styles to the selected card", () => {
    render(
      <DashboardStats
        selectedStatus="ซ่อม"
        onSelectStatus={() => {}}
        values={values}
      />,
    );
    const repairLabel = screen.getByText("ขั้นตอนซ่อม");
    const clickableCard = repairLabel.closest("div[class*='cursor-pointer']");
    expect(clickableCard).toBeTruthy();
    expect(clickableCard!).toHaveClass("border-blue-500");
  });

//เมื่อ parent เปลี่ยน selectedStatus UI ต้องเปลี่ยน active card ตาม
  it("update active styles when selectedStatus changes (rerender)", () => {
    const { rerender } = render(
      <DashboardStats
        selectedStatus="ทั้งหมด"
        onSelectStatus={() => {}}
        values={values}
      />,
    );

    const totalCard = screen
      .getByText("รถทั้งหมด")
      .closest("div[class*='cursor-pointer']");
    expect(totalCard!).toHaveClass("border-blue-500");

    rerender(
      <DashboardStats
        selectedStatus="เคลม"
        onSelectStatus={() => {}}
        values={values}
      />,
    );
    const claimCard = screen
      .getByText("ขั้นตอนเคลม")
      .closest("div[class*='cursor-pointer']");
    expect(claimCard!).toHaveClass("border-blue-500");
  });
});
