import { test, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import "@testing-library/jest-dom/vitest";

describe("Home Component", () => {
  test("renders the main title correctly", () => {
    render(<Home />);

    // get all titles and find specific one
    const titleElements = screen.getAllByText(/Going Nuts Since 1970/i);
    expect(titleElements).toHaveLength(3); // Ensure there are 3 titles
    expect(titleElements[0]).toHaveTextContent(
      "Going Nuts Since 1970 - Where Every Crunch Tells a Story!"
    );
  });

  test("renders the correct image", () => {
    render(<Home />);

    // getAllByAltText find duplicates and pick the first
    const imageElements = screen.getAllByAltText("The Nut Spot store");
    expect(imageElements).toHaveLength(2);
    expect(imageElements[0]).toBeInTheDocument();
  });

  test("renders customer reviews heading", () => {
    render(<Home />);

    // all headings with the name "Customer Reviews"
    const reviewHeadings = screen.getAllByRole("heading", {
      name: "Customer Reviews",
    });
    expect(reviewHeadings).toHaveLength(3);
    expect(reviewHeadings[0]).toBeInTheDocument();
  });
});
