import type { ReactNode } from "react";
import type { StorySceneKind } from "@/lib/story";

type Point = readonly [number, number, number];
type SceneProps = { step: number };
const ink = "var(--story-line)";
const soft = "var(--story-line-soft)";
const accent = "var(--story-accent)";
const top = "var(--story-top)";
const project = ([x, y, z]: Point) => [240 + (x - y) * .866, 245 + (x + y) * .5 - z];
const points = (vertices: readonly Point[]) => vertices.map((vertex) => project(vertex).join(",")).join(" ");

function Block({ x, y, z = 0, w, d, h, highlight = false }: { x: number; y: number; z?: number; w: number; d: number; h: number; highlight?: boolean }) {
  const stroke = highlight ? accent : ink;
  return <g stroke={stroke} strokeWidth=".8" strokeLinejoin="round">
    <polygon points={points([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill="var(--story-left)" />
    <polygon points={points([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill="var(--story-right)" />
    <polygon points={points([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={top} />
  </g>;
}

function Wire({ vertices, color = ink, dashed = false, width = .8 }: { vertices: readonly Point[]; color?: string; dashed?: boolean; width?: number }) {
  return <polyline points={points(vertices)} stroke={color} strokeWidth={width} strokeDasharray={dashed ? "3 4" : undefined} fill="none" strokeLinejoin="round" strokeLinecap="round" />;
}

function Front({ at, children }: { at: Point; children: ReactNode }) {
  const [x, y] = project(at);
  return <g transform={`matrix(.866 .5 0 1 ${x} ${y})`}>{children}</g>;
}

function Floor() {
  return <g opacity=".48">
    <polygon points={points([[-145, -90, -4], [145, -90, -4], [145, 105, -4], [-145, 105, -4]])} stroke={soft} strokeWidth=".6" fill="none" />
    {[-90, -30, 30, 90].map((x) => <Wire key={x} vertices={[[x, -90, -4], [x, 105, -4]]} color={soft} />)}
    {[-40, 20, 80].map((y) => <Wire key={y} vertices={[[-145, y, -4], [145, y, -4]]} color={soft} />)}
  </g>;
}

function Robot({ step }: SceneProps) {
  return <g className="story-scene-move" style={{ transform: `translate(${step === 1 ? -30 : 0}px, ${step === 1 ? -18 : 0}px)` }}>
    <Block x={70} y={40} w={8} d={12} h={10} />
    <Block x={88} y={40} w={8} d={12} h={10} />
    <Block x={72} y={41} z={10} w={5} d={7} h={10} />
    <Block x={88} y={41} z={10} w={5} d={7} h={10} />
    <Block x={68} y={33} z={20} w={30} d={23} h={33} />
    <Block x={62} y={36} z={25} w={6} d={12} h={23} />
    <Block x={98} y={36} z={25} w={6} d={12} h={23} />
    <Block x={65} y={31} z={57} w={36} d={27} h={26} />
    <Front at={[65, 58, 57]}><rect x="7" y="-18" width="5" height="4" fill={accent} /><rect x="24" y="-18" width="5" height="4" fill={accent} /><path d={step === 2 ? "M12 -7 L17 -4 L24 -10" : "M13 -7 H24"} stroke={ink} fill="none" /></Front>
    <Wire vertices={[[83, 42, 83], [83, 42, 98]]} />
    <circle cx={project([83, 42, 99])[0]} cy={project([83, 42, 99])[1]} r="3" fill={accent} className={step === 1 ? "story-led" : undefined} />
  </g>;
}

function SupervisorScene({ step }: SceneProps) {
  return <>
    <Floor />
    <Wire vertices={[[-28, 37, 1], [-28, 68, 1], [74, 68, 1], [74, 53, 1]]} color={step ? accent : soft} dashed />
    <Block x={-78} y={-35} w={78} d={65} h={174} />
    <Front at={[-78, 30, 0]}>
      {Array.from({ length: 6 }, (_, index) => <g key={index} transform={`translate(6,${-165 + index * 26})`}>
        <rect width="66" height="21" rx="1" fill="none" stroke={ink} strokeWidth=".8" />
        {[6, 10, 14, 18, 22, 26, 30, 34].map((x) => <path key={x} d={`M${x} 5 V16`} stroke={ink} strokeWidth=".6" />)}
        <circle cx="53" cy="12" r="1.6" fill={step === 1 || index === 2 ? accent : "var(--story-mute)"} className="story-led" style={{ animationDelay: `${index * -.37}s` }} />
        <circle cx="60" cy="12" r="1.3" fill={soft} />
      </g>)}
    </Front>
    {[-23, -12, -1, 10, 21].map((y) => <Wire key={y} vertices={[[.2, y, 22], [.2, y, 149]]} color={soft} />)}
    <Robot step={step} />
  </>;
}

function Laptop({ step, x = -86, y = -5, z = 38 }: SceneProps & { x?: number; y?: number; z?: number }) {
  return <>
    <Block x={x} y={y} z={z} w={122} d={7} h={88} />
    <Front at={[x + 6, y + 7.2, z]}>
      <rect x="0" y="-81" width="110" height="72" rx="2" stroke={soft} fill="var(--story-right)" />
      <text x="8" y="-65" fontSize="7" fill="var(--story-mute)">{["idea.tsx", "product.tsx", "deployed"][step]}</text>
      {[38, 66, 49, 76, 57].map((width, index) => <g key={index} opacity={index > step + 2 ? .25 : 1} className="story-scene-fade"><path d={`M${index % 2 ? 18 : 9} ${-52 + index * 8} h${width}`} stroke={index === step ? accent : ink} strokeWidth="1.4" /></g>)}
    </Front>
    <Block x={x} y={y + 7} z={z - 3} w={122} d={65} h={3} />
    {[18, 27, 36, 45].map((offset) => <Wire key={offset} vertices={[[x + 8, y + offset, z + .2], [x + 114, y + offset, z + .2]]} color={soft} />)}
    <Wire vertices={[[x + 46, y + 53, z + .2], [x + 76, y + 53, z + .2], [x + 76, y + 65, z + .2], [x + 46, y + 65, z + .2], [x + 46, y + 53, z + .2]]} color={soft} />
  </>;
}

function ConstructorScene({ step }: SceneProps) {
  return <>
    <Floor />
    <Block x={-132} y={-48} z={-3} w={256} d={137} h={8} />
    <Laptop step={step} z={8} />
    {[0, 1, 2].map((index) => <g key={index} className="story-scene-move" style={{ transform: `translateY(${step >= index ? -index * 6 : 10}px)` }}>
      <Block x={55 + index * 12} y={-54 + index * 28} z={60 + index * 34} w={52} d={4} h={48} highlight={index === step} />
      <Front at={[55 + index * 12, -50 + index * 28, 60 + index * 34]}>
        <path d="M7 -38 H45 M7 -30 H45" stroke={soft} />
        {index === 0 ? <><rect x="8" y="-23" width="14" height="15" fill="none" stroke={ink} /><path d="M29 -22 H44 M29 -16 H40" stroke={ink} /></> : index === 1 ? <text x="12" y="-12" fontSize="17" fill={index === step ? accent : "var(--story-mute)"}>{"</>"}</text> : <path d="M17 -18 l6 6 13 -14" stroke={index === step ? accent : ink} strokeWidth="1.8" fill="none" />}
      </Front>
    </g>)}
  </>;
}

function Parcel({ x, y, z = 0, highlight = false }: { x: number; y: number; z?: number; highlight?: boolean }) {
  return <><Block x={x} y={y} z={z} w={25} d={22} h={23} highlight={highlight} /><Wire vertices={[[x + 12, y, z + 23.2], [x + 12, y + 22, z + 23.2], [x + 12, y + 22, z + 10]]} color={highlight ? accent : soft} /></>;
}

function Truck({ x, y }: { x: number; y: number }) {
  return <>
    <Block x={x} y={y} z={8} w={62} d={30} h={5} />
    <Block x={x} y={y} z={13} w={39} d={30} h={31} />
    <Block x={x + 40} y={y} z={13} w={24} d={30} h={23} />
    <Front at={[x + 40, y + 30.3, 13]}><rect x="3" y="-20" width="16" height="10" rx="1" stroke={ink} fill="var(--story-right)" /><path d="M5 -6 H9" stroke={ink} /></Front>
    {[12, 51].map((offset) => <Front key={offset} at={[x + offset, y + 31, 6]}><circle r="6" fill="var(--story-right)" stroke={ink} /><circle r="2" fill={top} stroke={soft} /></Front>)}
    <Wire vertices={[[x + 64.2, y + 4, 16], [x + 64.2, y + 10, 16]]} color={accent} width={2} />
  </>;
}

function WarehouseScene({ step }: SceneProps) {
  return <>
    <Floor />
    <Block x={-125} y={-57} z={-7} w={250} d={152} h={6} />
    {[-102, 22].map((x) => [-46, -8].map((y) => <Block key={`${x}:${y}`} x={x} y={y} w={4} d={4} h={144} />))}
    {[10, 56, 102].map((z, row) => <g key={z}>
      <Block x={-102} y={-46} z={z} w={128} d={42} h={3} />
      {[-92, -52, -12].map((x, index) => <g key={x} opacity={step === 2 && row === 0 && index === 2 ? .14 : 1} className="story-scene-fade"><Parcel x={x} y={-34} z={z + 3} highlight={step === 1 && row === 0 && index === 2} /></g>)}
    </g>)}
    <g className="story-scene-move" style={{ transform: `translate(${step === 2 ? 24 : 0}px, ${step === 2 ? 14 : 0}px)` }}><Truck x={37} y={48} /></g>
    <Parcel x={-25} y={54} highlight={step === 1} />
  </>;
}

function ForecastScene({ step }: SceneProps) {
  return <>
    <Floor />
    <Block x={-35} y={-2} w={65} d={48} h={6} />
    <Block x={-10} y={7} z={6} w={16} d={15} h={45} />
    <Block x={-105} y={-8} z={51} w={188} d={12} h={118} />
    <Front at={[-98, 4.2, 51]}>
      <rect x="0" y="-111" width="174" height="99" rx="1" fill="var(--story-right)" stroke={soft} />
      <text x="9" y="-96" fontSize="8" fill="var(--story-mute)">TimeGPT</text>
      {[-80, -62, -44, -26].map((y) => <path key={y} d={`M10 ${y} H165`} stroke={soft} strokeWidth=".5" />)}
      <path d="M10 -34 L20 -42 L30 -37 L40 -60 L50 -49 L60 -55 L70 -45 L80 -71 L90 -61 L100 -66" stroke="var(--story-text)" strokeWidth="1.3" fill="none" />
      <path d="M100 -66 L114 -69 L126 -88 L140 -82 L153 -101 L165 -99 L165 -57 L153 -60 L140 -49 L126 -55 L114 -44 Z" fill={accent} opacity={step === 2 ? .16 : 0} className="story-scene-fade" />
      <path d="M100 -66 L114 -57 L126 -73 L140 -66 L153 -84 L165 -81" stroke={accent} strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity={step > 0 ? 1 : .1} className="story-scene-fade" />
      <path d="M100 -86 V-20" stroke={soft} strokeDasharray="2 3" />
      <circle cx="100" cy="-66" r="2" fill={accent} />
    </Front>
    <Block x={-97} y={53} z={0} w={156} d={42} h={4} />
    {[62, 72, 82].map((y) => <Wire key={y} vertices={[[-87, y, 4.2], [48, y, 4.2]]} color={soft} />)}
  </>;
}

function DevicesScene({ step }: SceneProps) {
  return <>
    <Floor />
    <Block x={-95} y={-12} z={0} w={126} d={9} h={184} />
    <Front at={[-88, -2.8, 0]}>
      <rect x="0" y="-172" width="112" height="157" rx="3" fill="var(--story-right)" stroke={soft} />
      <rect x="7" y="-151" width="98" height="104" rx="2" fill={top} stroke={soft} />
      <circle cx="57" cy="-113" r="17" stroke={ink} fill="var(--story-left)" />
      <path d="M28 -62 V-67 C28 -90 85 -90 85 -67 V-62" stroke={ink} fill="var(--story-left)" />
      <rect x="79" y="-142" width="20" height="27" rx="2" stroke={ink} fill="var(--story-right)" />
      {[35, 56, 77].map((x, index) => <circle key={x} cx={x} cy="-30" r="6" stroke={index === step ? accent : ink} fill="none" />)}
      <path d="M53 -31 h6 v3 h-6z" fill={accent} />
      <circle cx="56" cy="-180" r="1.2" fill={ink} />
    </Front>
    <Wire vertices={[[35, 1, 35], [69, 1, 35], [69, 35, 35], [88, 35, 35]]} color={step === 2 ? accent : soft} dashed />
    <Block x={79} y={35} z={0} w={50} d={8} h={105} highlight={step === 2} />
    <Front at={[84, 43.3, 0]}>
      <rect x="0" y="-96" width="40" height="83" rx="2" fill="var(--story-right)" stroke={soft} />
      <circle cx="20" cy="-72" r="9" stroke={ink} fill={top} />
      <path d="M9 -52 H31 M9 -46 H25" stroke={ink} />
      <rect x="7" y="-32" width="26" height="11" rx="2" stroke={accent} fill={step === 2 ? accent : "none"} />
      <path d="M14 -6 H26" stroke={ink} strokeLinecap="round" />
    </Front>
  </>;
}

function DeliveryScene({ step }: SceneProps) {
  const stops = [[-98, 26], [-10, 26], [54, -24]];
  return <>
    <Block x={-150} y={-93} z={-8} w={300} d={205} h={8} />
    <Wire vertices={[[-132, 22, .3], [116, 22, .3]]} color={soft} width={8} />
    <Wire vertices={[[35, -72, .3], [35, 90, .3]]} color={soft} width={8} />
    <Wire vertices={[[-124, 22, .6], [35, 22, .6], [35, -42, .6], [112, -42, .6]]} color={accent} dashed width={1.1} />
    {[[-115, -64, 36], [-63, -64, 53], [77, 64, 39], [-100, 65, 20]].map(([x, y, h]) => <g key={`${x}:${y}`}><Block x={x} y={y} w={30} d={25} h={h} /><Front at={[x, y + 25.1, 0]}>{[8, 20].map((left) => <path key={left} d={`M${left} ${-h + 9} v${h - 18}`} stroke={soft} strokeDasharray="4 5" />)}</Front></g>)}
    <g className="story-scene-move" style={{ transform: `translate(${(stops[step][0] - stops[0][0] - stops[step][1] + stops[0][1]) * .866}px, ${(stops[step][0] - stops[0][0] + stops[step][1] - stops[0][1]) * .5}px)` }}><Truck x={-98} y={26} /></g>
    <Wire vertices={[[120, -43, 1], [120, -43, 54]]} color={accent} />
    <polygon points={points([[120, -43, 54], [138, -43, 48], [120, -43, 40]])} fill={accent} />
  </>;
}

function DeskScene({ step }: SceneProps) {
  return <g transform="translate(0 18)">
    {[-115, 102].map((x) => [-68, 54].map((y) => <Block key={`${x}:${y}`} x={x} y={y} w={5} d={5} h={51} />))}
    <Block x={-123} y={-76} z={51} w={243} d={147} h={7} />
    <Laptop step={step} x={-50} y={-27} z={62} />
    {[0, 1, 2].map((index) => <g key={index}><Block x={-109 + index * 3} y={-29 - index * 2} z={58 + index * 9} w={41} d={49} h={8} highlight={step === index} /><Wire vertices={[[-106 + index * 3, 20 - index * 2, 62 + index * 9], [-72 + index * 3, 20 - index * 2, 62 + index * 9]]} color={soft} /></g>)}
    <Block x={82} y={-48} z={58} w={22} d={22} h={4} />
    <Wire vertices={[[93, -37, 62], [93, -37, 135], [67, -37, 152]]} color={ink} width={2} />
    <Block x={51} y={-48} z={148} w={32} d={25} h={9} />
    <Wire vertices={[[65, -35, 146], [65, -35, 135]]} color={accent} width={2} />
  </g>;
}

function CohortsScene({ step }: SceneProps) {
  return <>
    <Floor />
    {[{ x: -110, y: 16, index: 0 }, { x: 31, y: -23, index: 1 }].map(({ x, y, index }) => <g key={index} className="story-scene-move" style={{ transform: `translateY(${step === index || step === 2 ? -6 : 0}px)` }}>
      <Wire vertices={[[x + 18, y + 3, 117], [x + 12, y - 2, 194], [x + 54, y - 2, 194], [x + 58, y + 3, 117]]} color={index === step || step === 2 ? accent : ink} width={1.7} />
      <Block x={x} y={y} z={0} w={79} d={5} h={123} highlight={index === step || step === 2} />
      <Front at={[x, y + 5.2, 0]}>
        <rect x="30" y="-117" width="19" height="4" rx="2" fill="var(--story-right)" stroke={soft} />
        {index === 0 ? <><image href="/images/y-combinator.svg" x="20" y="-100" width="40" height="40" /><text x="14" y="-41" fill="var(--story-ink)" fontSize="9">Y COMBINATOR</text><text x="26" y="-23" fill="var(--story-mute)" fontSize="13">W22</text></> : <><text x="12" y="-81" fill="var(--story-ink)" fontSize="10">PLATANUS</text><text x="12" y="-66" fill="var(--story-mute)" fontSize="9">VENTURES</text><path d="M12 -52 H65" stroke={accent} /><text x="22" y="-27" fill="var(--story-ink)" fontSize="17">2023</text></>}
      </Front>
    </g>)}
  </>;
}

const scenes: Record<StorySceneKind, (props: SceneProps) => ReactNode> = {
  supervisor: SupervisorScene, constructor: ConstructorScene, warehouse: WarehouseScene, forecast: ForecastScene,
  devices: DevicesScene, delivery: DeliveryScene, desk: DeskScene, cohorts: CohortsScene,
};

export function StoryIllustration({ kind, step }: { kind: StorySceneKind; step: number }) {
  const Scene = scenes[kind];
  return <svg viewBox="0 0 480 360" aria-hidden="true" focusable="false" className="story-illustration"><Scene step={step} /></svg>;
}
