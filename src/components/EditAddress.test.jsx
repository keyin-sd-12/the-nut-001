import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import EditAddress from "./EditAddress";

const initialAddress = {
  first_name: "",
  last_name: "",
  address_line_1: "",
  address_line_2: "",
  city_name: "",
  province_name: "",
  postal_code: "",
  telephone_number: "",
  email: "",
};

const onSaveMock = vi.fn();
const onCancelMock = vi.fn();

describe("EditAddress Component", () => {
  test("renders all input fields correctly", () => {
    render(
      <EditAddress
        initial_address={initialAddress}
        on_save={onSaveMock}
        on_cancel={onCancelMock}
        show_email={true}
      />
    );

    expect(screen.getByLabelText("First Name")).toBeTruthy();
    expect(screen.getByLabelText("Last Name")).toBeTruthy();
    expect(screen.getByLabelText("Address Line 1")).toBeTruthy();
    expect(screen.getByLabelText("City")).toBeTruthy();
    expect(screen.getByLabelText("Province (e.g., ON)")).toBeTruthy();
    expect(screen.getByLabelText("Postal Code (e.g., A1A 1A1)")).toBeTruthy();
    expect(screen.getByLabelText("Telephone Number (10 digits)")).toBeTruthy();
    expect(screen.getByLabelText("Email Address")).toBeTruthy();
  });

  test("handles input changes correctly", () => {
    render(
      <EditAddress
        initial_address={initialAddress}
        on_save={onSaveMock}
        on_cancel={onCancelMock}
        show_email={true}
      />
    );

    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(firstNameInput.value).toBe("John");
  });
});
