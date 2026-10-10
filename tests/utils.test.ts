import { describe, expect, it } from "vitest";
import { cn } from "../src/utils/cn";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
  });

  it("handles conditional class names", () => {
    expect(cn("px-2", false && "py-1", "bg-blue-500")).toBe("px-2 bg-blue-500");
  });
});
