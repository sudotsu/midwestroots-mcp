import { describe, expect, it } from "vitest";
import {
  getAvailableSpeciesQuestions,
  getNextSpeciesQuestion,
  speciesGuideQuestions,
} from "./species-guide-questions.js";

describe("progressive Species question model", () => {
  it("uses one stable key per question", () => {
    expect(speciesGuideQuestions.length).toBeGreaterThan(0);
    expect(new Set(speciesGuideQuestions.map(({ key }) => key)).size).toBe(speciesGuideQuestions.length);
  });

  it("starts by resolving leaf availability", () => {
    expect(getNextSpeciesQuestion({})?.key).toBe("season");
  });

  it("does not show leaf questions until usable leaves are explicitly confirmed", () => {
    const keys = getAvailableSpeciesQuestions({}).map(({ key }) => key);
    expect(keys).not.toEqual(expect.arrayContaining(["leafArrangement", "leafType", "leafShape"]));
    expect(keys).toEqual(expect.arrayContaining(["season", "bark", "fruit", "overallForm", "sizeClass"]));
  });

  it("keeps leaf questions when usable leaves are visible", () => {
    const keys = getAvailableSpeciesQuestions({ season: "leaf-on" }).map(({ key }) => key);
    expect(keys).toEqual(expect.arrayContaining(["leafArrangement", "leafType", "leafShape"]));
  });

  it("removes leaf questions when leaf evidence is unavailable", () => {
    const keys = getAvailableSpeciesQuestions({ season: "leaf-off-or-unavailable" }).map(({ key }) => key);
    expect(keys).not.toEqual(expect.arrayContaining(["leafArrangement", "leafType", "leafShape"]));
    expect(keys).toEqual(expect.arrayContaining(["bark", "fruit", "overallForm", "sizeClass"]));
  });

  it("keeps safety questions separate and last", () => {
    const keys = getAvailableSpeciesQuestions({ season: "leaf-off-or-unavailable" }).map(({ key }) => key);
    expect(keys.slice(-2)).toEqual(["visibleFailureSign", "targetWithinReach"]);
  });
});
