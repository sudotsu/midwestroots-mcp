// Midwest Roots homeowner routing policy, shared with the five-part Hazard
// screen. Homeowners report visible conditions; Midwest Roots determines
// whether ordinary tree work needs utility coordination.
export type UtilityStatus = "clear" | "nearby-or-uncertain" | "apparent-contact" | "active-electrical-signs";
export type UtilityRoute = "none" | "midwest-review" | "midwest-review-stay-clear" | "oppd-first";

export const utilityReviewHref = "/contact?source=utility-review&service=Other";

export const utilityGuidance: Record<UtilityStatus, {
  route: UtilityRoute;
  heading: string;
  explanation: string;
}> = {
  clear: {
    route: "none",
    heading: "No overhead electric-line involvement reported",
    explanation: "No overhead electric line was reported near the tree or expected work area.",
  },
  "nearby-or-uncertain": {
    route: "midwest-review",
    heading: "Ask Midwest Roots to review the line context",
    explanation: "For nearby or uncertain lines, pause the work and ask Midwest Roots to review the situation. You do not need to decide line ownership, voltage, clearance, or whether OPPD is needed.",
  },
  "apparent-contact": {
    route: "midwest-review-stay-clear",
    heading: "Stay clear and ask Midwest Roots to review the line contact",
    explanation: "If the tree or branches appear to touch a line, stay clear and do not attempt the work. Midwest Roots reviews the situation and determines whether utility coordination is required.",
  },
  "active-electrical-signs": {
    route: "oppd-first",
    heading: "Stay clear and report the electrical warning to OPPD",
    explanation: "For a downed wire, arcing, or fire, stay clear and report the electrical condition to OPPD. Call 911 for fire or an immediate threat to people. Do not approach the tree, wire, or anything touching it.",
  },
};

export const utilityRoutingSummary = [
  utilityGuidance["nearby-or-uncertain"].explanation,
  utilityGuidance["apparent-contact"].explanation,
  utilityGuidance["active-electrical-signs"].explanation,
].join(" ");
