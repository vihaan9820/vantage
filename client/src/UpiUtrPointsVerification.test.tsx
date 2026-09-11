// @vitest-environment jsdom
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UpiPaymentModal } from "./components/UpiPaymentModal";

// Mock fetch to prevent real network calls
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, status: "approved" }),
  })
);

describe("UpiPaymentModal - Any 12-digit UTR Verification", () => {
  const mockPack = {
    label: "Starter",
    points: 100,
    price: "₹49",
    priceNumeric: 49,
    value: "100 Skill Points",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("accepts '123456789012' and immediately calls onSuccess with the credited reference", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <UpiPaymentModal pack={mockPack} onSuccess={onSuccess} onClose={onClose} />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 123456789012/i);
    fireEvent.change(input, { target: { value: "123456789012" } });

    const verifyBtn = screen.getByRole("button", {
      name: /Verify Payment & Claim 100 Points/i,
    });

    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("Direct UPI Verified (UTR: 123456789012)");
  });

  it("accepts dummy sequence '000000000000' without error and credits points", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <UpiPaymentModal pack={mockPack} onSuccess={onSuccess} onClose={onClose} />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 123456789012/i);
    fireEvent.change(input, { target: { value: "000000000000" } });

    const verifyBtn = screen.getByRole("button", {
      name: /Verify Payment & Claim 100 Points/i,
    });

    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("Direct UPI Verified (UTR: 000000000000)");
  });

  it("auto-fill button populates input and successfully verifies", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <UpiPaymentModal pack={mockPack} onSuccess={onSuccess} onClose={onClose} />
    );

    const autoFillBtn = screen.getByRole("button", {
      name: /Auto-fill 123456789012/i,
    });
    fireEvent.click(autoFillBtn);

    const input = screen.getByPlaceholderText(/e\.g\. 123456789012/i) as HTMLInputElement;
    expect(input.value).toBe("123456789012");

    const verifyBtn = screen.getByRole("button", {
      name: /Verify Payment & Claim 100 Points/i,
    });

    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("Direct UPI Verified (UTR: 123456789012)");
  });

  it("rejects input with less than 12 digits and shows error message", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <UpiPaymentModal pack={mockPack} onSuccess={onSuccess} onClose={onClose} />
    );

    const input = screen.getByPlaceholderText(/e\.g\. 123456789012/i);
    fireEvent.change(input, { target: { value: "12345" } });

    const verifyBtn = screen.getByRole("button", {
      name: /Verify Payment & Claim 100 Points/i,
    });

    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "Invalid UTR format: Bank UTR / UPI Reference must be exactly 12 numeric digits."
    );
  });
});
