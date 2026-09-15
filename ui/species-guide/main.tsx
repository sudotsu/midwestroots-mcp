import { App } from "@modelcontextprotocol/ext-apps/app-with-deps";
import type { McpUiToolInputNotification, McpUiToolResultNotification } from "@modelcontextprotocol/ext-apps/app-with-deps";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { SpeciesTraitVisual } from "../../tools/species-guide/vendor/omahatreecare/src/components/tools/SpeciesTraitVisual.js";
import { speciesGuideQuestions } from "../../tools/species-guide/vendor/omahatreecare/src/data/species-guide-questions.js";

type Candidate = {
  profileId: string; commonName: string; scientificName: string; taxonScope: string;
  matches: string[]; contradictions: string[];
  matchedEvidence: Array<{ category: string; observationValue: string; observationLabel: string }>;
  conflictingEvidence: Array<{ observationLabel: string; profileValueLabels: string[] }>;
};
type Question = {
  key: string; eyebrow: string; prompt: string; help: string; visualKind: string | null;
  options: Array<{ value: string; label: string; description?: string }>;
};
type GuideOutput = {
  treeCase: unknown;
  caseReference: { caseId: string; activeTreeId: string; expectedRevision: number };
  observations: Record<string, string | null>;
  skippedObservations: string[];
  result: {
    kind: string; startingCount: number; validObservationCount: number; primaryTied: boolean;
    primaryCandidate: Candidate | null; candidates: Candidate[]; alternatives: Candidate[];
    candidateOrderMeaning: string; outsideSupportedUniverse: boolean;
    unsupportedObservations: Array<{ observationLabel: string }>;
    nextObservation: string | null; identificationStatus: "not-confirmed";
  };
  activeTreeEvidence: Array<{
    evidenceId: string; field: string; value: string | null; label: string; origin: string; state: string;
  }>;
  nextQuestion: Question | null;
  change: null | { previousCount: number; currentCount: number; eliminatedProfileIds: string[]; returnedProfileIds: string[]; eliminatedCandidates: Array<{ profileId: string; commonName: string }>; returnedCandidates: Array<{ profileId: string; commonName: string }>; message: string };
  safetyRoute: null | { heading: string; explanation: string; firstAction: string; interruptsCurrentCapability: boolean };
  hazardHandoff: null | {
    kind: "visible-failure-target"; heading: string; explanation: string; firstAction: "open-hazard-screening";
    interruptsCurrentCapability: true; affectsSpeciesRanking: false;
  };
  uiState: string;
  handoffs: Array<{ id: string; label: string }>;
  platform: {
    originalPhotoAvailable: boolean;
    photoCount: number;
    photoFileIds: string[];
    photoLimitation: string | null;
  };
};
type GuideInput = {
  case: unknown;
  request: { treeCase: unknown; observations: Record<string, string | null>; skippedObservations: string[] };
  previousObservations?: Record<string, string | null>;
  previousSkippedObservations?: string[];
  photos?: Array<{
    download_url: string;
    file_id: string;
    mime_type?: string;
    file_name?: string;
  }>;
  evidenceAction?: {
    kind: "record" | "confirm" | "correct";
    evidenceId: string;
    nextEvidenceId?: string;
    field?: string;
    value?: string | null;
    sourceTurnId?: string;
    recordedAt: string;
  };
};

declare global {
  interface Window {
    openai?: {
      getFileDownloadUrl?: (input: { fileId: string }) => Promise<{ downloadUrl: string }>;
    };
  }
}

const app = new App({ name: "midwest-roots-species-guide", version: "1.0.0" }, {}, { autoResize: true, strict: true });

function originLabel(origin: string, state: string) {
  const origins: Record<string, string> = {
    user_stated: "Homeowner stated", image_observed: "Observed from photo", model_inferred: "Model proposed",
    tool_derived: "Guide derived", external_source: "External source", unknown: "Origin unknown",
  };
  const states: Record<string, string> = {
    "confirmed-by-user": "Confirmed by homeowner", observed: "Observed", provisional: "Provisional", conflicted: "Conflicted", unknown: "Unknown",
  };
  return `${origins[origin] ?? origin} · ${states[state] ?? state}`;
}

function resultHeading(output: GuideOutput) {
  const { result } = output;
  if (result.outsideSupportedUniverse) return "This tree appears to fall outside this 10-tree guide.";
  if (result.kind === "no-match") return "No match among these trees.";
  if (result.candidates.some(({ contradictions }) => contradictions.length > 0)) return "These observations point in different directions.";
  if (result.primaryTied) return `${result.candidates.length} trees still fit equally well.`;
  if (result.primaryCandidate) return "Best current match · not confirmed";
  if (result.validObservationCount === 0 && !result.nextObservation && output.skippedObservations.length > 0) return "No useful clue remains right now.";
  if (result.validObservationCount === 0) return "Let's figure out what you're looking at.";
  return `${result.candidates.length} still fit what we know.`;
}

function CandidatePlate({ candidate, equal }: { candidate: Candidate; equal: boolean }) {
  const visualEvidence = candidate.matchedEvidence[0];
  const visualKind = visualEvidence ? ({
    leafArrangement: "leaf-arrangement",
    leafType: "leaf-type",
    leafShape: "leaf-shape",
    bark: "bark",
    fruit: "fruit",
    overallForm: "crown",
    sizeClass: "size",
  } as Record<string, string>)[visualEvidence.category] : undefined;
  return <article className="candidate" data-equal={equal || undefined}>
    <div className="candidate-identity"><span className="index">SPECIMEN</span>
      <h3>{candidate.commonName}</h3><p className="latin">{candidate.scientificName}</p>
      {visualEvidence && visualKind && <div className="candidate-visual" aria-label={`Illustration of supporting clue: ${visualEvidence.observationLabel}`}><SpeciesTraitVisual kind={visualKind as never} value={visualEvidence.observationValue}/></div>}
      <p className="limit">Current comparison · not confirmed</p>
    </div>
    <div className="evidence-column">
      {candidate.matchedEvidence.length > 0 && <div className="evidence supports"><b>Supports</b>{candidate.matchedEvidence.map((item, index) => <span key={index}>✓ {item.observationLabel}</span>)}</div>}
      {candidate.conflictingEvidence.length > 0 && <div className="evidence conflicts"><b>Conflicts</b>{candidate.conflictingEvidence.map((item, index) => <span key={index}>! {item.observationLabel}; profile shows {item.profileValueLabels.join(" or ")}</span>)}</div>}
    </div>
  </article>;
}

function AlternativePlate({ candidate, busy, onOpenProfile }: {
  candidate: Candidate;
  busy: boolean;
  onOpenProfile: (profileId: string) => void;
}) {
  return <article className="alternative">
    <div><span className="index">PARTIAL MATCH</span><h3>{candidate.commonName}</h3><p className="latin">{candidate.scientificName}</p></div>
    <div className="alternative-evidence">
      <p><b>Supports</b> {candidate.matchedEvidence.map(({ observationLabel }) => observationLabel).join("; ") || "No current supporting clue"}</p>
      {candidate.conflictingEvidence.length > 0 && <p className="conflicts"><b>Conflicts</b> {candidate.conflictingEvidence.map(({ observationLabel, profileValueLabels }) => `${observationLabel}; profile shows ${profileValueLabels.join(" or ")}`).join("; ")}</p>}
    </div>
    <button className="profile-link" disabled={busy} type="button" onClick={() => onOpenProfile(candidate.profileId)}>Open source-backed profile</button>
  </article>;
}

export function Guide({ output, input, onOutput }: { output: GuideOutput; input: GuideInput; onOutput: (next: GuideOutput, nextInput: GuideInput) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(input.photos?.[0]?.file_id ?? null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string | null>>({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const candidates = useMemo(() => output.result.candidates, [output]);
  const alternatives = useMemo(() => output.result.alternatives, [output]);
  const photos = input.photos ?? [];
  const selectedPhoto = photos.find(({ file_id }) => file_id === selectedPhotoId) ?? photos[0];
  const photoUrl = selectedPhoto ? photoUrls[selectedPhoto.file_id] ?? null : null;
  const evidencedObservations = useMemo(() => new Set(output.activeTreeEvidence.map(({ field, value }) => `${field.replace("species.", "")}:${value ?? ""}`)), [output]);
  const editingEvidence = output.activeTreeEvidence.find(({ evidenceId }) => evidenceId === editingEvidenceId);
  const editingQuestion = editingEvidence
    ? speciesGuideQuestions.find(({ key }) => key === editingEvidence.field.replace("species.", ""))
    : undefined;
  const activeQuestion = editingQuestion ?? output.nextQuestion;

  useEffect(() => {
    if (photos.length === 0) setSelectedPhotoId(null);
    else if (!photos.some(({ file_id }) => file_id === selectedPhotoId)) setSelectedPhotoId(photos[0]!.file_id);
  }, [input.photos, selectedPhotoId]);

  useEffect(() => {
    if (!selectedPhoto) return;

    let active = true;
    setPhotoLoading(true);
    const getFileDownloadUrl = window.openai?.getFileDownloadUrl;
    if (!getFileDownloadUrl) {
      setPhotoUrls((current) => ({ ...current, [selectedPhoto.file_id]: null }));
      setPhotoLoading(false);
      return;
    }

    void getFileDownloadUrl({ fileId: selectedPhoto.file_id })
      .then(({ downloadUrl }) => {
        if (!active) return;
        setPhotoUrls((current) => ({ ...current, [selectedPhoto.file_id]: downloadUrl }));
      })
      .catch(() => {
        if (active) setPhotoUrls((current) => ({ ...current, [selectedPhoto.file_id]: null }));
      })
      .finally(() => { if (active) setPhotoLoading(false); });
    return () => { active = false; };
  }, [selectedPhoto?.file_id]);

  async function updateObservation(
    key: string,
    value?: string,
    evidence?: GuideOutput["activeTreeEvidence"][number],
  ) {
    setBusy(true); setError(null);
    const nextObservations = { ...output.observations };
    const nextSkipped = output.skippedObservations.filter((field) => field !== key);
    if (value === undefined) {
      delete nextObservations[key];
      if (key !== "season") nextSkipped.push(key);
    } else {
      nextObservations[key] = value;
    }
    const interactionId = crypto.randomUUID();
    const evidenceAction: GuideInput["evidenceAction"] = evidence
      ? value === undefined
        ? {
            kind: "correct",
            evidenceId: evidence.evidenceId,
            nextEvidenceId: `evidence-${interactionId}`,
            value: null,
            sourceTurnId: `ui-${interactionId}`,
            recordedAt: new Date().toISOString(),
          }
        : evidence.value === value && evidence.state === "provisional"
          ? {
              kind: "confirm",
              evidenceId: evidence.evidenceId,
              nextEvidenceId: `evidence-${interactionId}`,
              recordedAt: new Date().toISOString(),
            }
          : {
              kind: "correct",
              evidenceId: evidence.evidenceId,
              nextEvidenceId: `evidence-${interactionId}`,
              value,
              sourceTurnId: `ui-${interactionId}`,
              recordedAt: new Date().toISOString(),
            }
      : value === undefined
        ? undefined
        : {
            kind: "record",
            evidenceId: `evidence-${interactionId}`,
            field: key,
            value,
            sourceTurnId: `ui-${interactionId}`,
            recordedAt: new Date().toISOString(),
          };
    const nextInput: GuideInput = {
      ...input,
      request: { ...input.request, observations: nextObservations, skippedObservations: nextSkipped },
      previousObservations: output.observations,
      previousSkippedObservations: output.skippedObservations,
      evidenceAction,
    };
    try {
      const call = await app.callServerTool({ name: "render_species_guide", arguments: nextInput });
      if (call.isError || !call.structuredContent) throw new Error("The field guide could not update this observation.");
      const nextOutput = call.structuredContent as GuideOutput;
      onOutput(nextOutput, {
        ...nextInput,
        case: nextOutput.treeCase,
        request: { ...nextInput.request, treeCase: nextOutput.caseReference },
        evidenceAction: undefined,
      });
      setEditingEvidenceId(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The field guide could not update.");
    } finally { setBusy(false); }
  }

  async function openProfile(profileId: string) {
    setBusy(true); setError(null);
    try {
      const call = await app.callServerTool({ name: "get_species_profile", arguments: { profileId } });
      if (call.isError || !call.structuredContent) throw new Error("The source-backed profile could not be opened.");
      setProfile(call.structuredContent as Record<string, unknown>);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The source-backed profile could not be opened.");
    } finally { setBusy(false); }
  }

  if (output.safetyRoute?.interruptsCurrentCapability || output.hazardHandoff) return <main className="field-shell safety-interrupt">
    <Header output={output}/><section className="safety">
      {output.safetyRoute?.interruptsCurrentCapability ? <>
        <span className="eyebrow">UTILITY SAFETY · FIRST ACTION</span><h1>{output.safetyRoute.heading}</h1><p>{output.safetyRoute.explanation}</p>
      </> : output.hazardHandoff ? <>
        <span className="eyebrow">TREE / SITE SAFETY HANDOFF</span><h1>{output.hazardHandoff.heading}</h1><p>{output.hazardHandoff.explanation}</p>
      </> : null}
      {output.safetyRoute?.interruptsCurrentCapability && output.hazardHandoff && <div className="secondary-safety"><h2>{output.hazardHandoff.heading}</h2><p>{output.hazardHandoff.explanation}</p></div>}
      {output.hazardHandoff && <button className="hazard-handoff" type="button" onClick={() => void app.sendMessage({ role: "user", content: [{ type: "text", text: "I'm worried it might be unsafe" }] }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "The Hazard handoff could not be sent."))}>Continue to Hazard screening</button>}
      {error && <p className="error" role="alert">{error}</p>}
      <p className="case-preserved">Your Species investigation and field record are preserved for tree {output.caseReference.activeTreeId}. Resume only when it is appropriate to do so.</p>
    </section>
  </main>;

  return <main className="field-shell" data-state={output.uiState}>
    <Header output={output}/>
    <section className="investigation"><p className="eyebrow">CURRENT INVESTIGATION</p><h1>{resultHeading(output)}</h1>
      {output.change && <p className="change" role="status">◆ {output.change.message}</p>}
      {output.result.outsideSupportedUniverse && <p>{output.result.unsupportedObservations.map(({ observationLabel }) => observationLabel).join(", ")} falls outside this bounded Omaha deciduous guide. No candidate was invented.</p>}
      {output.result.kind === "no-match" && !output.result.outsideSupportedUniverse && <p>The current observations do not support any profile in this guide. Review or correct the field record to recompute it.</p>}
    </section>
    <section className="work-surface">
      <div className="specimen-column">
        <div className="specimen-frame" aria-label="Homeowner tree specimen area">
          {photoUrl ? <>
            <img className="homeowner-photo" src={photoUrl} alt={selectedPhoto?.file_name ? `Homeowner photo: ${selectedPhoto.file_name}` : `Homeowner tree photo ${photos.findIndex(({ file_id }) => file_id === selectedPhoto?.file_id) + 1}`} onError={() => selectedPhoto && setPhotoUrls((current) => ({ ...current, [selectedPhoto.file_id]: null }))}/>
            <p className="photo-source">HOMEOWNER PHOTO {photos.findIndex(({ file_id }) => file_id === selectedPhoto?.file_id) + 1} OF {output.platform.photoCount}</p>
          </> : <>
            <div className="tree-mark" aria-hidden="true"><span/><span/><span/></div>
            <h2>Your tree</h2><p>{photoLoading ? "Refreshing the selected homeowner photo…" : "No host-authorized photo is available in this field guide."}</p><small>{output.platform.photoLimitation ?? "The selected photo could not be refreshed through the ChatGPT file API. Image-derived evidence remains in the field record."}</small>
          </>}
        </div>
        {photos.length > 1 && <div className="photo-selector" role="group" aria-label="Choose a homeowner tree photo">
          {photos.map((photo, index) => <button key={photo.file_id} type="button" aria-pressed={photo.file_id === selectedPhoto?.file_id} onClick={() => setSelectedPhotoId(photo.file_id)}>
            <b>Photo {index + 1}</b><span>{photo.file_name ?? `Tree view ${index + 1}`}</span>
          </button>)}
        </div>}
        <div className="annotations"><h2>Field record</h2>
          {output.activeTreeEvidence.length === 0 && Object.keys(output.observations).length === 0 && <p className="empty-note">Add a photo in the conversation, or start with what you can see.</p>}
          {output.activeTreeEvidence.map((item) => <div className={`annotation ${item.state}`} key={item.evidenceId}><b>{item.label}</b><span>{originLabel(item.origin, item.state)}</span>
            {item.value !== null && <div className="annotation-actions">
              {item.state === "provisional" && <button type="button" disabled={busy} onClick={() => updateObservation(item.field.replace("species.", ""), item.value ?? undefined, item)}>Confirm</button>}
              <button type="button" disabled={busy} onClick={() => setEditingEvidenceId(item.evidenceId)}>Change this</button>
              <button type="button" disabled={busy} onClick={() => updateObservation(item.field.replace("species.", ""), undefined, item)}>I can't tell</button>
            </div>}
          </div>)}
          {Object.entries(output.observations).filter(([key, value]) => value != null && !evidencedObservations.has(`${key}:${value}`)).map(([key, value]) => <div className="annotation selected" key={`selected-${key}`}><b>{String(value).replaceAll("-", " ")}</b><span>{key.replace(/([A-Z])/g, " $1")} · current normalized observation</span></div>)}
          {output.skippedObservations.map((key) => <div className="annotation unknown" key={`skipped-${key}`}><b>{key.replace(/([A-Z])/g, " $1")}</b><span>Not visible · no penalty</span></div>)}
        </div>
      </div>
      <div className="investigation-column">
        <section className="universe" aria-live="polite"><span>{output.result.candidates.length || 0}</span><p>{output.result.validObservationCount === 0 ? `${output.result.startingCount} trees in this guide` : "current candidates"}</p></section>
        {activeQuestion && <fieldset className="comparison" disabled={busy}>
          <legend><span>{editingQuestion ? "RECHECK THIS CLUE" : activeQuestion.eyebrow}</span>{activeQuestion.prompt}</legend><p>{activeQuestion.help}</p>
          <div className="choices">{activeQuestion.options.map((option) => <button type="button" key={option.value} onClick={() => updateObservation(activeQuestion.key, option.value, editingEvidence)} aria-label={`${option.label}. ${option.description ?? ""}`}>
            <SpeciesTraitVisual kind={(activeQuestion.visualKind ?? undefined) as never} value={option.value}/><b>{option.label}</b>{option.description && <small>{option.description}</small>}
          </button>)}</div>
          <button type="button" className="not-sure" onClick={() => updateObservation(activeQuestion.key, undefined, editingEvidence)}>I can't see this · continue without it</button>
          {editingQuestion && <button type="button" className="cancel-recheck" onClick={() => setEditingEvidenceId(null)}>Keep the current observation</button>}
        </fieldset>}
        {error && <p className="error" role="alert">{error}</p>}
        <section className="candidate-rail" aria-label="Current Species candidates">
          <header><h2>{output.result.primaryTied ? "Equal current matches" : "Candidate field"}</h2><small>{output.result.candidateOrderMeaning === "stable-display-only" ? "Display order does not indicate likelihood." : "Ordered by canonical evidence; scores are not probabilities."}</small></header>
          {output.change?.eliminatedCandidates.length ? <details className="eliminated" aria-label="Candidates removed by the latest clue"><summary><b>Removed by the latest clue</b><span>{output.change.eliminatedCandidates.length} candidate{output.change.eliminatedCandidates.length === 1 ? "" : "s"} · review</span></summary><div className="eliminated-list">{output.change.eliminatedCandidates.map(({ profileId, commonName }) => <span key={profileId}>{commonName}</span>)}</div></details> : null}
          {candidates.length > 4 ? <div className="candidate-index">{candidates.map((candidate) => <div className="candidate-row" key={candidate.profileId}><span><b>{candidate.commonName}</b><i>{candidate.scientificName}</i><small>Supports: {candidate.matchedEvidence.map(({ observationLabel }) => observationLabel).join("; ") || "no usable clue yet"}{candidate.conflictingEvidence.length ? ` · Conflicts: ${candidate.conflictingEvidence.map(({ observationLabel }) => observationLabel).join("; ")}` : ""}</small></span><button className="profile-link" disabled={busy} type="button" onClick={() => openProfile(candidate.profileId)}>Open profile</button></div>)}</div> : candidates.length > 0 ? candidates.map((candidate) => <div className="candidate-wrap" key={candidate.profileId}><CandidatePlate candidate={candidate} equal={output.result.primaryTied}/><button className="profile-link" disabled={busy} type="button" onClick={() => openProfile(candidate.profileId)}>Open source-backed profile</button></div>) : <p className="empty-candidates">No candidate selected. The full field record remains available for review.</p>}
        </section>
        {alternatives.length > 0 && <section className="alternatives" aria-label="Other partial Species matches">
          <header><div><span className="eyebrow">OTHER PARTIAL MATCHES</span><h2>Other trees with some supporting evidence</h2></div><p>These are lower-ranked canonical alternatives, separate from the current candidate set. Their order reflects evidence, not probability.</p></header>
          {alternatives.map((candidate) => <AlternativePlate key={candidate.profileId} candidate={candidate} busy={busy} onOpenProfile={openProfile}/>) }
        </section>}
        {profile && <section className="profile-drawer" aria-live="polite"><span className="eyebrow">SOURCE-BACKED PROFILE</span><h2>{String(profile.commonName)}</h2><p className="latin">{String(profile.scientificName)}</p><p>{String((profile.omahaRelevance as { text?: string } | undefined)?.text ?? "")}</p><p>{String((profile.matureSize as { text?: string } | undefined)?.text ?? "")}</p>
          <p className="source-note">Sources: {Array.isArray(profile.sourceIds) ? profile.sourceIds.join(", ") : "canonical profile sources"}</p>
          <p className="source-note">Content review: {String((profile.review as { finalContentReview?: string } | undefined)?.finalContentReview ?? "not reported")}</p>
          <button type="button" onClick={() => setProfile(null)}>Close profile</button></section>}
      </div>
    </section>
    {(output.result.primaryCandidate || output.result.kind === "no-match" || (!output.result.nextObservation && (output.result.primaryTied || output.skippedObservations.length > 0))) && <section className="completed"><span className="eyebrow">FIELD RECORD · NOT CONFIRMED</span><h2>{resultHeading(output)}</h2>
      <p>This guide narrows a bounded set of ten Omaha-area profiles. It does not confirm identification, diagnose a condition, or assess tree risk.</p>
      <nav aria-label="Continue with another tree-care question">{output.handoffs.map((item) => <button type="button" key={item.id} onClick={() => void app.sendMessage({ role: "user", content: [{ type: "text", text: item.label }] }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "The handoff could not be sent."))}>{item.label}</button>)}</nav>
    </section>}
  </main>;
}

function Header({ output }: { output: GuideOutput }) {
  return <header className="masthead"><span>MIDWEST ROOTS · FIELD GUIDE</span><span className="case">TREE {output.caseReference.activeTreeId}</span></header>;
}

function Root() {
  const [input, setInput] = useState<GuideInput | null>(null);
  const [output, setOutput] = useState<GuideOutput | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  useEffect(() => {
    const handleInput = ({ arguments: args }: McpUiToolInputNotification["params"]) => setInput(args as GuideInput);
    const handleResult = (result: McpUiToolResultNotification["params"]) => {
      if (!result.isError && result.structuredContent) setOutput(result.structuredContent as GuideOutput);
    };
    app.addEventListener("toolinput", handleInput);
    app.addEventListener("toolresult", handleResult);
    app.connect().catch((cause: unknown) => setConnectionError(cause instanceof Error ? cause.message : "Unable to connect to the host."));
    return () => {
      app.removeEventListener("toolinput", handleInput);
      app.removeEventListener("toolresult", handleResult);
      void app.close();
    };
  }, []);
  if (connectionError) return <main className="field-shell"><p role="alert">{connectionError}</p></main>;
  if (!output || !input) return <main className="field-shell loading"><p>Opening the current field record…</p></main>;
  return <Guide output={output} input={input} onOutput={(nextOutput, nextInput) => { setOutput(nextOutput); setInput(nextInput); }}/ >;
}

const root = document.getElementById("root");
if (!root) throw new Error("Species UI root is missing");
createRoot(root).render(<Root/>);
