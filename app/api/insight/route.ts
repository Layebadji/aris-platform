import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const vitality = Number(p.get('vitality') ?? '75');
  const cognitive = Number(p.get('cognitive') ?? '75');
  const metabolic = Number(p.get('metabolic') ?? '75');
  const recovery = Number(p.get('recovery') ?? '75');

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ insight: null }, { status: 503 });
  }

  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Tu es ARIS, conseiller en bio-performance pour dirigeants d'élite à Dakar.
Rédige exactement 2 phrases de conseil en français élégant et sobre pour ce dirigeant.
Données du jour : Vitalité ${vitality}/100 · Cognitif ${cognitive}/100 · Métabolique ${metabolic}/100 · Récupération ${recovery}/100.
Commence directement par le conseil, sans introduction ni signature. Sois précis et actionnable.`,
      },
    ],
  });

  const insight =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return NextResponse.json({ insight });
}
