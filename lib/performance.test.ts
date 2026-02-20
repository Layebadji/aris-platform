import { calculateVitalityScore } from './performance';

type Case = {
  label: string;
  input: Parameters<typeof calculateVitalityScore>[0];
  expected: number;
};

const cases: Case[] = [
  {
    // (78×0.4) + (82×0.3) + (71×0.3) = 31.2 + 24.6 + 21.3 = 77.1 → 77  |  pas de pénalité
    label: 'Données fallback dashboard (78 / 82 / 71)',
    input: { metabolic_stability: 78, cognitive_index: 82, recovery_index: 71 },
    expected: 77,
  },
  {
    // (80×0.4) + (90×0.3) + (50×0.3) = 32 + 27 + 15 = 74 − 10 (pénalité) = 64
    label: 'Pénalité active  — cognitive=90 > 85 ET recovery=50 < 60',
    input: { metabolic_stability: 80, cognitive_index: 90, recovery_index: 50 },
    expected: 64,
  },
  {
    // (80×0.4) + (90×0.3) + (60×0.3) = 32 + 27 + 18 = 77  |  recovery=60 n'est PAS < 60
    label: 'Pénalité inactive — cognitive=90 > 85 MAIS recovery=60 >= 60',
    input: { metabolic_stability: 80, cognitive_index: 90, recovery_index: 60 },
    expected: 77,
  },
  {
    // (50×0.4) + (86×0.3) + (55×0.3) = 20 + 25.8 + 16.5 = 62.3 − 10 = 52.3 → 52
    label: 'Pénalité active  — cognitive=86 > 85 ET recovery=55 < 60',
    input: { metabolic_stability: 50, cognitive_index: 86, recovery_index: 55 },
    expected: 52,
  },
  {
    label: 'Score parfait → clampé à 100',
    input: { metabolic_stability: 100, cognitive_index: 100, recovery_index: 100 },
    expected: 100,
  },
  {
    label: 'Score nul → clampé à 0',
    input: { metabolic_stability: 0, cognitive_index: 0, recovery_index: 0 },
    expected: 0,
  },
];

let passed = 0;
let failed = 0;

console.log('\n── ARIS · calculateVitalityScore ──────────────────\n');

for (const tc of cases) {
  const result = calculateVitalityScore(tc.input);
  const ok = result === tc.expected;
  const icon = ok ? '✓' : '✗';
  console.log(`${icon}  ${tc.label}`);
  if (!ok) {
    console.log(`   attendu : ${tc.expected}  |  obtenu : ${result}`);
  }
  ok ? passed++ : failed++;
}

console.log(`\n── ${passed}/${cases.length} réussis${failed > 0 ? ` — ${failed} ÉCHEC(S)` : ' — tout vert'} ──\n`);
if (failed > 0) process.exit(1);
