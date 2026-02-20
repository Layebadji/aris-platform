import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface DayData {
  date: string;
  vitality: number;
  cognitive: number;
  metabolic: number;
  recovery: number;
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ report: null }, { status: 503 });
  }

  const { days, userName, performanceGoal } = await request.json() as {
    days: DayData[];
    userName: string;
    performanceGoal: string;
  };

  if (!days || days.length === 0) {
    return NextResponse.json({ report: null }, { status: 400 });
  }

  const dataLines = days
    .map(
      (d) =>
        `${d.date} : Vitalité ${d.vitality} · Cognitif ${d.cognitive} · Métabolique ${d.metabolic} · Récupération ${d.recovery}`,
    )
    .join('\n');

  const avgVitality = Math.round(days.reduce((s, d) => s + d.vitality, 0) / days.length);
  const avgCognitive = Math.round(days.reduce((s, d) => s + d.cognitive, 0) / days.length);
  const avgRecovery = Math.round(days.reduce((s, d) => s + d.recovery, 0) / days.length);

  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `Tu es ARIS, conseiller en bio-performance pour dirigeants d'élite à Dakar. ARIS n'est pas un dispositif médical.

Rédige un rapport de performance hebdomadaire élégant et actionnable en 3 paragraphes distincts pour ${userName || 'ce dirigeant'}.
Objectif déclaré : ${performanceGoal || 'performance générale'}.

Données des 7 derniers jours (sur 100) :
${dataLines}

Moyennes : Vitalité ${avgVitality} · Cognitif ${avgCognitive} · Récupération ${avgRecovery}

Structure du rapport :
1. **Analyse de la semaine** : Identifie les tendances, pics et creux les plus significatifs.
2. **Point de vigilance** : Souligne le facteur qui a le plus impacté la performance globale.
3. **Cap pour la semaine suivante** : 2 recommandations concrètes et applicables dès lundi.

Écris en français élégant et sobre. Tutoyer est prohibé. Commence directement par le premier paragraphe.`,
      },
    ],
  });

  const report = message.content[0].type === 'text' ? message.content[0].text : '';

  return NextResponse.json({ report, avgVitality, avgCognitive, avgRecovery });
}
