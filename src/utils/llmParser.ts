import { ParsedFood } from '../types';

interface LLMFood {
  nom: string;
  quantite: number;
  unite: string;
  marque?: string;
  gout?: string;
}

export async function parseWithLLM(text: string): Promise<ParsedFood[] | null> {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  const key = metaEnv?.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'Extract food entities with quantity and unit. Respond with JSON array.'
          },
          { role: 'user', content: text }
        ]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = JSON.parse(data.choices?.[0]?.message?.content || 'null') as LLMFood[] | null;
    if (!raw) return null;
    return raw.map(f => ({
      nom: f.nom,
      quantite: Number(f.quantite),
      unite: f.unite,
      marque: f.marque,
      gout: f.gout
    }));
  } catch (e) {
    console.error('parseWithLLM error', e);
    return null;
  }
}

