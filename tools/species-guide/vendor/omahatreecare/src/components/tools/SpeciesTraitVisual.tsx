import type { SpeciesGuideQuestion } from "@/data/species-guide-questions";

type VisualKind = NonNullable<SpeciesGuideQuestion["visualKind"]>;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-amber-200 bg-amber-50/70 p-2" aria-hidden="true">
      <svg viewBox="0 0 160 96" className="h-full w-full" focusable="false">
        {children}
      </svg>
    </div>
  );
}

function Leaf({ x, y, rotate = 0, scale = 1 }: { x: number; y: number; rotate?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0 C-15 -15 -18 -34 0 -44 C18 -34 15 -15 0 0Z" fill="currentColor" opacity="0.82" />
      <path d="M0 0V-35" stroke="white" strokeWidth="1.7" opacity="0.8" />
    </g>
  );
}

function Twig({ opposite }: { opposite: boolean }) {
  return (
    <Frame>
      <g className="text-emerald-800">
        <path d="M80 88V10" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />
        {opposite ? (
          <>
            <path d="M80 58L48 44M80 58L112 44M80 31L52 20M80 31L108 20" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            <Leaf x={46} y={45} rotate={-62} scale={0.52} />
            <Leaf x={114} y={45} rotate={62} scale={0.52} />
            <Leaf x={50} y={21} rotate={-68} scale={0.45} />
            <Leaf x={110} y={21} rotate={68} scale={0.45} />
          </>
        ) : (
          <>
            <path d="M80 65L45 50M80 46L113 31M80 25L52 14" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            <Leaf x={43} y={51} rotate={-62} scale={0.52} />
            <Leaf x={115} y={32} rotate={62} scale={0.52} />
            <Leaf x={50} y={15} rotate={-68} scale={0.44} />
          </>
        )}
      </g>
    </Frame>
  );
}

function LeafType({ compound, needles }: { compound?: boolean; needles?: boolean }) {
  if (needles) {
    return (
      <Frame>
        <g stroke="#166534" strokeWidth="3" strokeLinecap="round">
          <path d="M24 74L136 25" stroke="#7c2d12" strokeWidth="5" />
          {[35, 50, 65, 80, 95, 110, 125].map((x, index) => (
            <g key={x} transform={`translate(${x} ${70 - index * 7})`}>
              <path d="M0 0L-9 -22M0 0L3 -24M0 0L12 -18" />
            </g>
          ))}
        </g>
      </Frame>
    );
  }
  return (
    <Frame>
      <g className="text-emerald-800">
        <path d="M80 87V24" stroke="#7c2d12" strokeWidth="5" strokeLinecap="round" />
        {compound ? (
          <>
            {[34, 49, 64].map((y, index) => (
              <g key={y}>
                <path d={`M80 ${y}L${48 - index * 2} ${y - 8}M80 ${y}L${112 + index * 2} ${y - 8}`} stroke="#7c2d12" strokeWidth="2.5" />
                <Leaf x={45 - index * 2} y={y - 7} rotate={-72} scale={0.38} />
                <Leaf x={115 + index * 2} y={y - 7} rotate={72} scale={0.38} />
              </g>
            ))}
            <Leaf x={80} y={28} scale={0.44} />
          </>
        ) : (
          <Leaf x={80} y={68} scale={1.05} />
        )}
      </g>
    </Frame>
  );
}

function LeafShape({ value }: { value: string }) {
  const paths: Record<string, string> = {
    "deeply-lobed": "M80 82L74 60L53 68L61 49L39 42L61 33L52 14L74 29L80 7L86 29L108 14L99 33L121 42L99 49L107 68L86 60Z",
    "rounded-lobes": "M80 84C70 73 55 78 54 64C42 58 48 43 61 42C53 31 62 18 75 25C78 14 82 14 85 25C98 18 107 31 99 42C112 43 118 58 106 64C105 78 90 73 80 84Z",
    "pointed-lobes": "M80 88C75 78 72 69 71 60L57 68L62 55L48 51L65 44L55 34L70 36L66 21L77 28L80 6L83 28L94 21L90 36L105 34L95 44L112 51L98 55L103 68L89 60C88 69 85 78 80 88Z",
    triangular: "M80 11C97 30 119 42 123 63C110 79 96 84 80 85C64 84 50 79 37 63C41 42 63 30 80 11Z",
    "oval-serrated": "M80 7L88 15L87 20L97 22L95 28L105 32L102 38L112 44L107 50L115 57L108 62L111 70L102 72L101 80L91 78L87 87L80 82L73 87L69 78L59 80L58 72L49 70L52 62L45 57L53 50L48 44L58 38L55 32L65 28L63 22L73 20L72 15Z",
    "elm-like": "M72 86L63 79L65 74L56 70L59 64L50 58L55 52L49 45L56 41L54 34L63 32L64 24L72 26L81 8L88 20L97 19L98 27L107 29L104 37L112 42L107 48L112 56L105 61L106 69L98 71L95 79L85 78L80 86Z",
    "many-small-leaflets": "M80 87V13M80 70L48 57M80 70L112 57M80 50L51 37M80 50L109 37M80 31L58 19M80 31L102 19",
    "very-large-compound": "M80 90V8M80 76L38 61M80 76L122 61M80 57L34 42M80 57L126 42M80 38L43 23M80 38L117 23",
  };
  const compound = value === "many-small-leaflets" || value === "very-large-compound";
  return (
    <Frame>
      {compound ? (
        <g className="text-emerald-800">
          <path d={paths[value]} stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
          {[48, 112, 51, 109, 58, 102].map((x, index) => <Leaf key={`${x}-${index}`} x={x} y={index < 2 ? 58 : index < 4 ? 38 : 20} rotate={x < 80 ? -65 : 65} scale={value === "very-large-compound" ? 0.5 : 0.34} />)}
        </g>
      ) : (
        <g className="text-emerald-800">
          <path d={paths[value] ?? paths["oval-serrated"]} fill="currentColor" opacity="0.85" />
          <path d={value === "elm-like" ? "M72 82L84 17" : "M80 87V20"} stroke="white" strokeWidth="2" opacity="0.8" />
          {value === "pointed-lobes" && (
            <g fill="#166534">
              {[[48, 51], [55, 34], [66, 21], [80, 6], [94, 21], [105, 34], [112, 51]].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
              ))}
            </g>
          )}
        </g>
      )}
    </Frame>
  );
}

function Bark({ value }: { value: string }) {
  const lines: Record<string, string[]> = {
    "diamond-ridged": ["M45 5L70 30L45 55L70 82", "M80 5L55 30L80 55L55 82", "M90 5L115 30L90 55L115 82", "M125 5L100 30L125 55L100 82"],
    "warty-corky": ["M48 13C61 4 66 24 79 14", "M87 34C102 20 114 42 126 29", "M43 57C55 43 70 66 83 51", "M88 76C101 61 116 83 127 68"],
    "smooth-to-scaly": ["M49 10C62 19 62 27 49 36", "M83 8C96 17 96 26 83 35", "M113 14C126 23 126 32 113 41", "M62 54L78 47L88 61L73 72Z", "M99 55L118 49L125 66L106 76Z"],
    "deeply-furrowed": ["M48 3C64 22 42 40 58 93", "M79 2C94 25 70 49 88 94", "M112 3C128 28 103 54 122 93"],
    "gray-furrowed": ["M50 4C61 25 46 48 60 92", "M82 3C94 28 75 53 90 93", "M114 4C124 29 108 55 120 92"],
    "rough-scaly": ["M45 15L65 7L72 24L55 34Z", "M82 12L105 5L113 25L91 34Z", "M112 43L130 36L136 57L117 65Z", "M55 52L79 43L87 65L64 75Z", "M86 75L108 67L116 88L94 93Z"],
  };
  return (
    <Frame>
      <rect x="34" y="2" width="102" height="92" rx="8" fill={value === "gray-furrowed" ? "#78716c" : "#92400e"} opacity="0.9" />
      <g fill="none" stroke="#fef3c7" strokeWidth={value === "deeply-furrowed" ? 7 : 4} strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
        {(lines[value] ?? lines["rough-scaly"]).map((line) => <path key={line} d={line} />)}
      </g>
    </Frame>
  );
}

function Fruit({ value }: { value: string }) {
  const acorn = value === "acorn" || value === "fringed-acorn-cap";
  let fruitVisual: React.ReactNode;

  if (value === "none-seen") {
    fruitVisual = (
      <g>
        <circle cx="80" cy="56" r="25" fill="none" stroke="#78716c" strokeWidth="5" />
        <path d="M61 75L99 37" stroke="#78716c" strokeWidth="5" />
      </g>
    );
  } else if (value === "paddle-seeds") {
    fruitVisual = (
      <g fill="#fbbf24" stroke="#92400e" strokeWidth="1.8">
        <path d="M80 31L52 44M80 31L67 48M80 31L94 47M80 31L111 43" fill="none" stroke="#7c2d12" strokeWidth="2" />
        {[[50, 45, -48], [65, 50, -17], [96, 49, 18], [113, 44, 48]].map(([x, y, rotate]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotate})`}>
            <ellipse cx="0" cy="2" rx="4.5" ry="6" fill="#78350f" />
            <path d="M0 7C-4 15-5 31 0 42C10 31 11 15 3 7Z" />
            <path d="M2 10L1 37" fill="none" stroke="#fef3c7" strokeWidth="1.2" opacity="0.8" />
          </g>
        ))}
      </g>
    );
  } else if (value === "paired-winged-seeds") {
    fruitVisual = (
      <g fill="#fcd34d" stroke="#92400e" strokeWidth="2">
        <path d="M75 61C61 56 43 42 31 22C51 25 69 38 79 55Z" />
        <path d="M85 61C99 56 117 42 129 22C109 25 91 38 81 55Z" />
        <path d="M36 27L74 57M124 27L86 57" fill="none" stroke="#fef3c7" strokeWidth="1.4" opacity="0.85" />
        <circle cx="75" cy="62" r="6.5" fill="#78350f" />
        <circle cx="85" cy="62" r="6.5" fill="#78350f" />
      </g>
    );
  } else if (value === "round-winged-seeds") {
    fruitVisual = (
      <g fill="#fde68a" stroke="#92400e" strokeWidth="2">
        {[[57, 55], [82, 66], [105, 48]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="16" />
            <circle cx={x - 2} cy={y + 1} r="4.5" fill="#78350f" />
          </g>
        ))}
      </g>
    );
  } else if (value === "long-flat-pods") {
    fruitVisual = (
      <g fill="#a16207" stroke="#78350f" strokeWidth="2">
        <path d="M54 27C44 44 45 73 55 88C63 75 65 44 54 27Z" />
        <path d="M103 27C91 46 92 76 104 89C112 70 113 44 103 27Z" />
        <path d="M54 35V80M103 35V81" fill="none" stroke="#fef3c7" strokeWidth="1.5" opacity="0.7" />
      </g>
    );
  } else if (value === "thick-dark-pods") {
    fruitVisual = (
      <g fill="#451a03" stroke="#78350f" strokeWidth="2.5">
        <path d="M48 38C43 54 45 77 58 87C71 78 72 54 65 37C60 31 52 32 48 38Z" />
        <path d="M94 37C87 55 90 79 103 87C117 76 118 53 111 37C106 31 99 31 94 37Z" />
        <g fill="#a16207" stroke="none">
          <circle cx="57" cy="51" r="5" /><circle cx="59" cy="68" r="5" />
          <circle cx="102" cy="50" r="5" /><circle cx="104" cy="68" r="5" />
        </g>
      </g>
    );
  } else if (acorn) {
    fruitVisual = (
      <g>
        <path d="M59 44C63 25 97 25 101 44C94 53 66 53 59 44Z" fill="#92400e" />
        <path d="M64 45C60 66 67 85 80 89C93 85 100 66 96 45Z" fill="#b45309" />
        {value === "fringed-acorn-cap" && <path d="M58 44L48 50M67 47L59 56M80 48V59M93 47L101 56M102 44L112 50" stroke="#78350f" strokeWidth="3" />}
      </g>
    );
  } else if (value === "cottony-seeds") {
    fruitVisual = (
      <g fill="white" stroke="#78716c" strokeWidth="1.5">
        {[55, 80, 105].map((x) => <circle key={x} cx={x} cy="58" r="17" />)}
        <circle cx="68" cy="42" r="15" /><circle cx="94" cy="42" r="15" />
      </g>
    );
  } else if (value === "small-round-pears") {
    fruitVisual = (
      <g fill="#84cc16" stroke="#4d7c0f" strokeWidth="1.5">
        {[[58, 57], [82, 68], [104, 52]].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y - 13}C${x - 4} ${y - 8} ${x - 11} ${y - 5} ${x - 11} ${y + 4}C${x - 11} ${y + 14} ${x + 11} ${y + 14} ${x + 11} ${y + 4}C${x + 11} ${y - 5} ${x + 4} ${y - 8} ${x} ${y - 13}Z`} />
        ))}
      </g>
    );
  } else {
    fruitVisual = (
      <g fill="#581c87">
        <circle cx="58" cy="55" r="10" /><circle cx="82" cy="66" r="10" /><circle cx="104" cy="49" r="10" />
      </g>
    );
  }

  return (
    <Frame>
      <path d="M80 7V34" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
      {fruitVisual}
    </Frame>
  );
}

function Crown({ value }: { value: string }) {
  const crownPaths: Record<string, string> = {
    vase: "M80 84V55M80 58L50 22M80 58L110 22M63 43L43 14M97 43L117 14",
    rounded: "M31 53C31 25 52 10 80 10C108 10 129 25 129 53C129 73 108 82 80 82C52 82 31 73 31 53Z",
    upright: "M52 72C42 43 54 12 80 8C106 12 118 43 108 72C98 84 62 84 52 72Z",
    "broad-spreading": "M15 62C19 31 43 20 80 25C117 20 141 31 145 62C128 80 32 80 15 62Z",
    "open-irregular": "M27 68C16 43 38 23 57 32C65 8 91 12 95 33C116 19 141 42 130 64C111 79 47 84 27 68Z",
  };
  const fillShape = value !== "vase";
  return (
    <Frame>
      <path d="M80 91V57" stroke="#7c2d12" strokeWidth="7" strokeLinecap="round" />
      <path d={crownPaths[value] ?? crownPaths.rounded} fill={fillShape ? "#15803d" : "none"} stroke="#15803d" strokeWidth={fillShape ? 3 : 9} strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
    </Frame>
  );
}

function Size({ value }: { value: string }) {
  const treeHeight = value === "under-40" ? 42 : value === "40-to-70" ? 61 : 82;
  return (
    <Frame>
      <path d="M25 86H142" stroke="#78716c" strokeWidth="3" />
      <rect x="118" y="48" width="18" height="38" rx="2" fill="#a8a29e" />
      <circle cx="127" cy="39" r="12" fill="#d6d3d1" />
      <path d={`M72 86V${90 - treeHeight}`} stroke="#7c2d12" strokeWidth="7" />
      <circle cx="72" cy={88 - treeHeight} r={treeHeight / 3.2} fill="#15803d" opacity="0.88" />
      <path d={`M42 ${91 - treeHeight}H102`} stroke="#b45309" strokeWidth="2" strokeDasharray="5 4" />
    </Frame>
  );
}

function Safety({ value }: { value: string }) {
  return (
    <Frame>
      <path d="M79 84V18" stroke="#7c2d12" strokeWidth="11" strokeLinecap="round" />
      <path d="M79 38L47 17M79 48L111 23" stroke="#7c2d12" strokeWidth="7" strokeLinecap="round" />
      {value === "yes" ? <path d="M72 45L86 55L74 65" fill="none" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" /> : null}
      {value === "not-sure" ? <text x="80" y="63" textAnchor="middle" fontSize="42" fontWeight="700" fill="#b45309">?</text> : null}
      {value === "no" ? <circle cx="80" cy="51" r="26" fill="none" stroke="#15803d" strokeWidth="5" /> : null}
    </Frame>
  );
}

export function SpeciesTraitVisual({ kind, value }: { kind?: VisualKind; value: string }) {
  if (!kind) return null;
  if (kind === "leaf-arrangement") return <Twig opposite={value === "opposite"} />;
  if (kind === "leaf-type") return <LeafType compound={value === "compound"} needles={value === "needles-or-scales"} />;
  if (kind === "leaf-shape") return <LeafShape value={value} />;
  if (kind === "bark") return <Bark value={value} />;
  if (kind === "fruit") return <Fruit value={value} />;
  if (kind === "crown") return <Crown value={value} />;
  if (kind === "size") return <Size value={value} />;
  if (kind === "safety") return <Safety value={value} />;
  if (kind === "season") return value === "leaf-on" ? <LeafType /> : <Bark value="deeply-furrowed" />;
  return null;
}
