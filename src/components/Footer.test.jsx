import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer Component", () => {
  test("renders contact information correctly", () => {
    render(<Footer />);
    const contactNumber = screen.getByText("1-888-NUT-SPOT");
    const address = screen.getByText(/123 Old Oak Street/i);

    expect(contactNumber).toBeInTheDocument();
    expect(address).toBeInTheDocument();
  });

  test("renders social media links with icons", () => {
    render(<Footer />);
    const facebookLinks = screen.getAllByRole("link", { name: /facebook/i });
    const instagramLinks = screen.getAllByRole("link", { name: /instagram/i });

    expect(facebookLinks[0]).toHaveAttribute("href", "https://www.facebook.com");
    expect(instagramLinks[0]).toHaveAttribute("href", "https://www.instagram.com");

    const facebookIcon = screen.getAllByAltText("Facebook")[0];
    const instagramIcon = screen.getAllByAltText("Instagram")[0];

    expect(facebookIcon).toBeInTheDocument();
    expect(instagramIcon).toBeInTheDocument();
  });

  test("contains Follow us text", () => {
    render(<Footer />);
    const followTexts = screen.getAllByText("Follow us");
    expect(followTexts[0]).toBeInTheDocument();
  });
});
