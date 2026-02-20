import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const vitality = Number(p.get('vitality') ?? '75');
  const cognitive = Number(p.get('cognitive') ?? '75');
  const metabolic = Number(p.get('metabolic') ?? '75');
  const recovery = Number(p.get('recovery') ?? '75');
  const glycemic_vigilance = p.get('glycemic_vigilance') === 'true';
  const hour = Number(p.get('hour') ?? new Date().getHours());

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ advice: null }, { status: 503 });
  }

  const mealMoment =
    hour >= 6 && hour < 11
      ? 'le petit-déjeuner ou la matinée de travail'
      : hour >= 11 && hour < 15
      ? 'le déjeuner'
      : hour >= 15 && hour < 19
      ? "l'après-midi et la réunion de fin de journée"
      : 'le dîner ou la récupération nocturne';

  const glycemicNote = glycemic_vigilance
    ? `Le dirigeant est en mode Vigilance Glycémique : évite de recommander le riz blanc du Thiéboudienne ou le riz jasmin du Yassa. Oriente-le vers le Bar Grillé au Quinoa ou le Poké Bowl Méditerranée (riz noir, index glycémique bas). Mentionne ce conseil de manière élégante.`
    : '';

  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 220,
    messages: [
      {
        role: 'user',
        content: `Tu es ARIS, Directeur de la Performance Alimentaire pour dirigeants d'élite à Dakar. Tu n'es pas un dispositif médical et tes conseils ne remplacent pas un suivi médical réel.
Rédige exactement 2 à 3 phrases de conseil alimentaire personnalisé en français élégant et sobre.

Données du dirigeant : Vitalité ${vitality}/100 · Cognitif ${cognitive}/100 · Métabolique ${metabolic}/100 · Récupération ${recovery}/100.
Moment de la journée : ${mealMoment}.
${glycemicNote}

Réfère-toi si pertinent aux plats disponibles à Dakar (Thiéboudienne, Bar au Quinoa, Mafé, Poké Bowl Méditerranée, Yassa). Commence directement par le conseil, sans formule de politesse ni signature.`,
      },
    ],
  });

  const advice =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return NextResponse.json({ advice });
}
