import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const dish = p.get('dish') ?? '';
  const description = p.get('description') ?? '';
  const cognitive_boost = p.get('cognitive_boost') === 'true';
  const recovery_support = p.get('recovery_support') === 'true';
  const metabolic_compatibility = p.get('metabolic_compatibility') ?? '';

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ analysis: null }, { status: 503 });
  }

  const benefits = [
    cognitive_boost && 'boost cognitif',
    recovery_support && 'soutien à la récupération musculaire',
  ]
    .filter(Boolean)
    .join(', ') || 'équilibre général';

  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 280,
    messages: [
      {
        role: 'user',
        content: `Tu es ARIS, expert en nutrition de haute performance pour dirigeants d'élite à Dakar.
Rédige une analyse nutritionnelle précise et sobre en 3 phrases pour ce plat.

Plat : ${dish}
Description : ${description}
Bénéfices : ${benefits}
Compatibilité métabolique : ${metabolic_compatibility}

Détaille les macronutriments dominants, l'impact glycémique et l'effet concret sur la performance cognitive ou physique du dirigeant. Commence directement par l'analyse, sans introduction ni signature.`,
      },
    ],
  });

  const analysis =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return NextResponse.json({ analysis });
}
