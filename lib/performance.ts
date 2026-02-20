import type { HealthLog } from '@/lib/types/database';

export type VitalityInputs = Pick<
  HealthLog,
  'metabolic_stability' | 'cognitive_index' | 'recovery_index'
>;

/**
 * Calcule le score de vitalité ARIS selon l'équation de bio-performance :
 *   Vitality = (Metabolic × 0.4) + (Cognitive × 0.3) + (Recovery × 0.3)
 *
 * Une pénalité de −10 points est appliquée en cas de surcharge cognitive
 * combinée à une récupération insuffisante (cognitive_index > 85 ET recovery_index < 60).
 *
 * @returns Score entier clampé dans l'intervalle [0, 100].
 */
export function calculateVitalityScore({
  metabolic_stability,
  cognitive_index,
  recovery_index,
}: VitalityInputs): number {
  let score =
    metabolic_stability * 0.4 +
    cognitive_index * 0.3 +
    recovery_index * 0.3;

  if (cognitive_index > 85 && recovery_index < 60) {
    score -= 10;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}
