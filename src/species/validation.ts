import { SpeciesMatchInputSchema } from "./schemas.js";
import { TreeCaseSchema, type TreeCase } from "../case/schema.js";

export function parseSpeciesMatchInput(input: unknown, treeCaseInput: TreeCase) {
  const treeCase = TreeCaseSchema.parse(treeCaseInput);
  return SpeciesMatchInputSchema.superRefine((value, context) => {
    if (value.treeCase.caseId !== treeCase.caseId) {
      context.addIssue({ code: "custom", path: ["treeCase", "caseId"], message: "caseId does not match the supplied Tree Case" });
    }
    if (value.treeCase.activeTreeId !== treeCase.activeTreeId) {
      context.addIssue({ code: "custom", path: ["treeCase", "activeTreeId"], message: "activeTreeId does not match the supplied Tree Case" });
    }
    if (value.treeCase.expectedRevision !== treeCase.revision) {
      context.addIssue({ code: "custom", path: ["treeCase", "expectedRevision"], message: "Tree Case revision is stale" });
    }
  }).parse(input);
}
