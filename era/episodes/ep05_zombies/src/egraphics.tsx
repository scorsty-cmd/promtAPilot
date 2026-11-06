import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { C } from './sets';

const CH = '#f1eee2', AM = '#ecc94b', RD = '#e53e3e', BL = '#63b3ed', GR = '#48bb78';
type GP = { t: number; T: number; d: number };

const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; children: React.ReactNode }> = ({
  x, y, s = 40, c = CH, a = 'middle', o = 1, f = 'Brico', children
}) => (
  <text x={x} y={y} fontFamily={f} fontSize={s} fill={c} textAnchor={a} opacity={o}>
    {children}
  </text>
);

const fade = (t: number, a: number) => clamp((t - a) * 3);

/* Explainer Panel Base with Post-Apocalyptic Grid & Atmospheric Spores */
export const Board: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode }> = ({ t, title, note, children }) => (
  <g>
    <rect x={-200} y={-200} width={2320} height={1480} fill="#0d1117" />
    {/* Dark HUD / Grid Background */}
    <rect x={40} y={30} width={1840} height={1020} fill="#161b22" stroke="#30363d" strokeWidth={6} rx={8} />

    {/* Subtle grid lines */}
    {Array.from({ length: 18 }).map((_, i) => (
      <line key={'h' + i} x1={40} y1={30 + i * 56} x2={1880} y2={30 + i * 56} stroke="#21262d" strokeWidth={1} />
    ))}
    {Array.from({ length: 32 }).map((_, i) => (
      <line key={'v' + i} x1={40 + i * 58} y1={30} x2={40 + i * 58} y2={1050} stroke="#21262d" strokeWidth={1} />
    ))}

    {/* Animated Floating Biohazard Spores */}
    {Array.from({ length: 35 }).map((_, i) => {
      const R = rng(i + 55);
      const y = (R() * 1000 + t * (15 + R() * 20)) % 1000 + 40;
      return (
        <circle
          key={'s' + i}
          cx={60 + R() * 1800 + Math.sin(t * 1.5 + i) * 12}
          cy={y}
          r={1.5 + R() * 2.5}
          fill={AM}
          opacity={0.18}
        />
      );
    })}

    {/* Title Header */}
    <T_ x={960} y={115} s={56} c={AM} o={fade(t, 0.1)}>
      {title}
    </T_>
    <path
      d={`M ${960 - 350 * easeOut(prog(t, 0.2, 1))} 145 L ${960 + 350 * easeOut(prog(t, 0.2, 1))} 145`}
      stroke={RD}
      strokeWidth={4}
    />

    {children}

    {note && (
      <T_ x={960} y={1010} s={24} c="#8b949e" o={fade(t, 0.6)}>
        {note}
      </T_>
    )}
  </g>
);

/* 1. EPIDEMIC R-ZERO COMPARISON */
export const RZeroExplainer: React.FC<GP> = ({ t }) => {
  const p = easeOut(prog(t, 0.4, 2.5));
  return (
    <Board t={t} title="EPIDEMIOLOGICAL REPRODUCTION RATE (R₀)" note="Source: Alemi et al. (2015) Cornell University statistical mechanics model">
      <g transform="translate(180 260)">
        {/* Flu Bar */}
        <text x={0} y={50} fontFamily="Brico" fontSize={34} fill={CH}>Seasonal Flu</text>
        <rect x={260} y={15} width={lerp(0, 70, p)} height={45} rx={4} fill={BL} />
        <text x={275 + lerp(0, 70, p)} y={48} fontFamily="Brico" fontSize={28} fill={BL}>R₀ ≈ 1.3</text>

        {/* Measles Bar */}
        <text x={0} y={170} fontFamily="Brico" fontSize={34} fill={CH}>Measles (Highly Contagious)</text>
        <rect x={260} y={135} width={lerp(0, 360, p)} height={45} rx={4} fill={AM} />
        <text x={275 + lerp(0, 360, p)} y={168} fontFamily="Brico" fontSize={28} fill={AM}>R₀ ≈ 12 - 18</text>

        {/* Zombie Pathogen Bar */}
        <text x={0} y={290} fontFamily="Brico" fontSize={34} fill={RD} fontWeight="bold">Outbreak Infection</text>
        <rect x={260} y={255} width={lerp(0, 820, p)} height={45} rx={4} fill={RD} />
        <text x={275 + lerp(0, 820, p)} y={288} fontFamily="Brico" fontSize={32} fill={RD} fontWeight="bold">R₀ &gt; 20.0 (Hours to double)</text>

        {/* Insight Box */}
        <rect x={0} y={390} width={1560} height={180} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />
        <text x={40} y={450} fontFamily="Brico" fontSize={32} fill={CH}>
          • In a megacity with 8+ million residents, an R₀ above 10 causes a cascade failure.
        </text>
        <text x={40} y={510} fontFamily="Brico" fontSize={32} fill={AM}>
          • Cornell simulation: 90% of metropolitan residents infected within 72 hours.
        </text>
      </g>
    </Board>
  );
};

/* 2. NATURE'S REAL ZOMBIES (Cordyceps & Rabies) */
export const ParasiteExplainer: React.FC<GP> = ({ t }) => {
  const pulse = Math.sin(t * 5) * 0.15 + 0.85;
  return (
    <Board t={t} title="NATURE'S REAL PUPPET MASTERS" note="Biological precedents in nature: motor neuron takeover vs limbic aggression">
      <g transform="translate(180 240)">
        {/* Left Side: Ophiocordyceps */}
        <rect x={0} y={0} width={740} height={640} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />
        <text x={370} y={60} fontFamily="Brico" fontSize={36} fill={AM} textAnchor="middle">Ophiocordyceps (Zombie Ant)</text>
        <line x1={40} y1={85} x2={700} y2={85} stroke="#30363d" strokeWidth={2} />

        <circle cx={370} cy={220} r={75 * pulse} fill="none" stroke={AM} strokeWidth={5} strokeDasharray="8 6" />
        <text x={370} y={230} fontFamily="Brico" fontSize={26} fill={AM} textAnchor="middle">Fungal Infiltration</text>

        <text x={50} y={360} fontFamily="Brico" fontSize={28} fill={CH}>• Hyphae invade muscle fibers directly.</text>
        <text x={50} y={420} fontFamily="Brico" fontSize={28} fill={CH}>• Bypasses brain to seize physical locomotion.</text>
        <text x={50} y={480} fontFamily="Brico" fontSize={28} fill={CH}>• Mandibles lock onto leaf vein before death.</text>
        <text x={50} y={540} fontFamily="Brico" fontSize={28} fill={AM}>• Result: Spores explode to infect the entire nest.</text>

        {/* Right Side: Rabies Virus */}
        <g transform="translate(820 0)">
          <rect x={0} y={0} width={740} height={640} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />
          <text x={370} y={60} fontFamily="Brico" fontSize={36} fill={RD} textAnchor="middle">Rabies Virus (Rhabdoviridae)</text>
          <line x1={40} y1={85} x2={700} y2={85} stroke="#30363d" strokeWidth={2} />

          <circle cx={370} cy={220} r={75 * pulse} fill="none" stroke={RD} strokeWidth={5} strokeDasharray="8 6" />
          <text x={370} y={230} fontFamily="Brico" fontSize={26} fill={RD} textAnchor="middle">Limbic Hijack</text>

          <text x={50} y={360} fontFamily="Brico" fontSize={28} fill={CH}>• Concentrates in salivary glands for bite spread.</text>
          <text x={50} y={420} fontFamily="Brico" fontSize={28} fill={CH}>• Suppresses prefrontal fear & empathy.</text>
          <text x={50} y={480} fontFamily="Brico" fontSize={28} fill={CH}>• Induces extreme hydrophobia & aggression.</text>
          <text x={50} y={540} fontFamily="Brico" fontSize={28} fill={RD}>• Reality: Host remains fully subject to human fatigue.</text>
        </g>
      </g>
    </Board>
  );
};

/* 3. 72-HOUR WATER PURIFICATION */
export const WaterExplainer: React.FC<GP> = ({ t }) => {
  const drip = (t * 80) % 240;
  return (
    <Board t={t} title="THE 72-HOUR CRITICAL WATER PROTOCOL" note="Municipal pumps fail when the electrical grid collapses. Dehydration kills in 3 days.">
      <g transform="translate(180 240)">
        {/* 3-Layer Filter Column */}
        <rect x={80} y={40} width={360} height={520} rx={8} fill="#1a202c" stroke={CH} strokeWidth={6} />
        {/* Sand Layer */}
        <rect x={90} y={70} width={340} height={120} fill="#d69e2e" opacity={0.7} />
        <text x={260} y={140} fontFamily="Brico" fontSize={28} fill="#1a202c" textAnchor="middle" fontWeight="bold">Layer 1: Coarse Sand</text>

        {/* Charcoal Layer */}
        <rect x={90} y={200} width={340} height={130} fill="#2d3748" />
        <text x={260} y={275} fontFamily="Brico" fontSize={28} fill={CH} textAnchor="middle" fontWeight="bold">Layer 2: Activated Charcoal</text>

        {/* Fine Gravel Layer */}
        <rect x={90} y={340} width={340} height={110} fill="#718096" />
        <text x={260} y={405} fontFamily="Brico" fontSize={28} fill={CH} textAnchor="middle" fontWeight="bold">Layer 3: Fine Gravel</text>

        {/* Dripping Clean Water */}
        <circle cx={260} cy={480 + drip} r={8} fill={BL} />

        {/* Right Instructions */}
        <g transform="translate(520 60)">
          <rect x={0} y={0} width={1000} height={180} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />
          <text x={40} y={60} fontFamily="Brico" fontSize={32} fill={AM}>Step 1: Mechanical Filtration</text>
          <text x={40} y={120} fontFamily="Brico" fontSize={26} fill={CH}>Pours muddy rainwater through the sand/charcoal column to remove all suspended solids.</text>

          <rect x={0} y={220} width={1000} height={200} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />
          <text x={40} y={280} fontFamily="Brico" fontSize={32} fill={BL}>Step 2: Chemical & Thermal Disinfection</text>
          <text x={40} y={335} fontFamily="Brico" fontSize={26} fill={CH}>• Rolling boil: 3 full minutes kills all cysts, bacteria, and viral proteins.</text>
          <text x={40} y={385} fontFamily="Brico" fontSize={26} fill={GR}>• Bleach alternative: 2 drops unscented 6% household bleach per liter (wait 30 min).</text>
        </g>
      </g>
    </Board>
  );
};

/* 4. CANNED FOOD CHEMISTRY & BOTULISM */
export const FoodExplainer: React.FC<GP> = ({ t }) => {
  return (
    <Board t={t} title="SURVIVAL NUTRITION & BOTULISM SAFETY" note="Botulinum neurotoxin is the deadliest poison on Earth. Never consume from damaged cans.">
      <g transform="translate(180 240)">
        {/* Safe Can vs Danger Can */}
        <g transform="translate(100 80)">
          <rect x={0} y={0} width={220} height={280} rx={12} fill="#718096" stroke={GR} strokeWidth={8} />
          <text x={110} y={150} fontFamily="Brico" fontSize={32} fill={GR} textAnchor="middle" fontWeight="bold">SAFE CAN</text>
          <text x={110} y={200} fontFamily="Brico" fontSize={22} fill={CH} textAnchor="middle">Flat lid · Intact seal</text>
          <text x={110} y={340} fontFamily="Brico" fontSize={26} fill={GR} textAnchor="middle">Decades of sterility</text>
        </g>

        <g transform="translate(460 80)">
          <path d="M 0 30 Q 110 -20 220 30 L 220 280 L 0 280 Z" fill="#718096" stroke={RD} strokeWidth={8} />
          <text x={110} y={150} fontFamily="Brico" fontSize={32} fill={RD} textAnchor="middle" fontWeight="bold">DANGER!</text>
          <text x={110} y={200} fontFamily="Brico" fontSize={22} fill={CH} textAnchor="middle">Bulging lid (Gas buildup)</text>
          <text x={110} y={340} fontFamily="Brico" fontSize={26} fill={RD} textAnchor="middle">Clostridium botulinum</text>
        </g>

        {/* Survival Math Box */}
        <g transform="translate(780 40)">
          <rect x={0} y={0} width={740} height={460} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />
          <text x={40} y={65} fontFamily="Brico" fontSize={32} fill={AM}>Calorie & Nutrient Accounting</text>
          <text x={40} y={130} fontFamily="Brico" fontSize={26} fill={CH}>• Baseline adult requirement: 1,800 to 2,200 kcal/day.</text>
          <text x={40} y={190} fontFamily="Brico" fontSize={26} fill={CH}>• Non-acidic canned goods (meat/beans) maintain calories for 20+ years.</text>
          <text x={40} y={250} fontFamily="Brico" fontSize={26} fill={CH}>• Acidic cans (tomatoes/fruits) degrade after 18-24 months due to acid corrosion.</text>
          <text x={40} y={320} fontFamily="Brico" fontSize={26} fill={RD}>• Scurvy Prevention: Vitamin C tablets or pine needle tea prevent scurvy within 90 days.</text>
        </g>
      </g>
    </Board>
  );
};

/* 5. CORNELL GEOGRAPHIC SIMULATION */
export const GeographyExplainer: React.FC<GP> = ({ t }) => {
  const p = easeOut(prog(t, 0.4, 2.0));
  return (
    <Board t={t} title="GEOGRAPHY OF SURVIVAL (CORNELL MODEL)" note="Simulations prove population density dictates infection velocity. Run to high altitude.">
      <g transform="translate(180 240)">
        {/* High Risk vs Low Risk Columns */}
        <rect x={0} y={0} width={740} height={600} rx={8} fill="#21262d" stroke={RD} strokeWidth={4} />
        <text x={370} y={60} fontFamily="Brico" fontSize={34} fill={RD} textAnchor="middle" fontWeight="bold">ZONE 0: FATAL (0 - 72 Hours)</text>
        <line x1={40} y1={85} x2={700} y2={85} stroke="#30363d" strokeWidth={2} />

        <text x={50} y={160} fontFamily="Brico" fontSize={28} fill={CH}>• Dense Metropolises (New York, London, Paris)</text>
        <text x={50} y={220} fontFamily="Brico" fontSize={28} fill={CH}>• Highway bottlenecks & interstate choke points</text>
        <text x={50} y={280} fontFamily="Brico" fontSize={28} fill={CH}>• Suburban shopping corridors</text>
        <text x={50} y={360} fontFamily="Brico" fontSize={28} fill={RD}>• Collapse Speed: Exponential cascade in days.</text>

        <g transform="translate(820 0)">
          <rect x={0} y={0} width={740} height={600} rx={8} fill="#21262d" stroke={GR} strokeWidth={4} />
          <text x={370} y={60} fontFamily="Brico" fontSize={34} fill={GR} textAnchor="middle" fontWeight="bold">ZONE 1: HAVENS (Months to Reach)</text>
          <line x1={40} y1={85} x2={700} y2={85} stroke="#30363d" strokeWidth={2} />

          <text x={50} y={160} fontFamily="Brico" fontSize={28} fill={CH}>• High Altitude: Rocky Mountains, Swiss Alps</text>
          <text x={50} y={220} fontFamily="Brico" fontSize={28} fill={CH}>• Offshore Islands with freshwater aquifers</text>
          <text x={50} y={280} fontFamily="Brico" fontSize={28} fill={CH}>• Remote agricultural ridges with natural vantage</text>
          <text x={50} y={360} fontFamily="Brico" fontSize={28} fill={GR}>• Why: Inability of hosts to navigate rugged topography.</text>
        </g>
      </g>
    </Board>
  );
};

/* 6. FREEZING & BIOLOGICAL DECAY */
export const FreezeExplainer: React.FC<GP> = ({ t }) => {
  return (
    <Board t={t} title="THE PHYSIOLOGY OF FREEZING & DECAY" note="Host tissues are 70% water. Sub-zero temperatures completely arrest locomotion.">
      <g transform="translate(180 240)">
        <rect x={0} y={0} width={1560} height={580} rx={8} fill="#21262d" stroke="#30363d" strokeWidth={3} />

        <g transform="translate(80 80)">
          <text x={0} y={40} fontFamily="Brico" fontSize={36} fill={BL} fontWeight="bold">Winter: Sub-Zero Mechanics (&lt; 0°C)</text>
          <text x={0} y={110} fontFamily="Brico" fontSize={28} fill={CH}>
            1. Intracellular ice crystals rupture muscle sarcolemma membranes.
          </text>
          <text x={0} y={170} fontFamily="Brico" fontSize={28} fill={CH}>
            2. At -10°C, synovial fluid in human joints freezes, causing complete mechanical paralysis.
          </text>
          <text x={0} y={230} fontFamily="Brico" fontSize={28} fill={BL}>
            3. The infected cannot insulate themselves or make fire. Nature freezes them solid.
          </text>
        </g>

        <line x1={80} y1={360} x2={1480} y2={360} stroke="#30363d" strokeWidth={3} />

        <g transform="translate(80 400)">
          <text x={0} y={40} fontFamily="Brico" fontSize={36} fill={AM} fontWeight="bold">Spring Thaw: Forensic Taphonomy</text>
          <text x={0} y={100} fontFamily="Brico" fontSize={28} fill={CH}>
            • Thawing causes rapid cellular breakdown; blowfly larvae and putrefactive bacteria skeletonize remains in 21 days.
          </text>
        </g>
      </g>
    </Board>
  );
};

/* 7. THE METABOLIC CRASH (60-DAY DIE OFF) */
export const CrashExplainer: React.FC<GP> = ({ t }) => {
  const p = easeInOut(prog(t, 0.4, 3.0));
  return (
    <Board t={t} title="THE 60-DAY METABOLIC CRASH" note="All living hosts require glucose and water. Depletion leads to organ shutdown.">
      <g transform="translate(180 240)">
        {/* Decline Graph */}
        <line x1={100} y1={460} x2={1400} y2={460} stroke={CH} strokeWidth={4} />
        <line x1={100} y1={460} x2={100} y2={80} stroke={CH} strokeWidth={4} />

        <text x={100} y={50} fontFamily="Brico" fontSize={28} fill={RD}>Active Infected Population</text>
        <text x={1420} y={470} fontFamily="Brico" fontSize={28} fill={CH}>Day 0 to Day 100</text>

        {/* Bell Curve Collapse */}
        <path
          d={`M 100 440 Q 300 100 600 ${lerp(440, 260, p)} T 1300 440`}
          fill="none"
          stroke={RD}
          strokeWidth={8}
        />

        <g transform="translate(700 120)">
          <rect x={0} y={0} width={680} height={240} rx={8} fill="#161b22" stroke="#30363d" strokeWidth={2} />
          <text x={30} y={60} fontFamily="Brico" fontSize={30} fill={AM}>Biochemical Reality:</text>
          <text x={30} y={120} fontFamily="Brico" fontSize={26} fill={CH}>• Day 15: Acute dehydration sets in.</text>
          <text x={30} y={170} fontFamily="Brico" fontSize={26} fill={CH}>• Day 30: Glycogen & fat stores exhausted.</text>
          <text x={30} y={220} fontFamily="Brico" fontSize={26} fill={GR}>• Day 60: Massive biological die-off complete.</text>
        </g>
      </g>
    </Board>
  );
};
