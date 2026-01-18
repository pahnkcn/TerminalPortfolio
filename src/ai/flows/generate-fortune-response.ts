'use server';

import { z } from 'zod';
import { generateAiText } from '@/ai/client';
import { extractJsonPayload } from '@/ai/extract-json-payload';

const GenerateFortuneResponseOutputSchema = z.object({
  fortune: z.string().min(1),
});

export type GenerateFortuneResponseOutput = z.infer<typeof GenerateFortuneResponseOutputSchema>;

const MAX_FORTUNE_LENGTH = 140;

const sanitizeFortune = (fortune: string) =>
  fortune
    .replace(/\s+/g, ' ')
    .replace(/^["']|["']$/g, '')
    .trim()
    .slice(0, MAX_FORTUNE_LENGTH);

const buildFortunePrompt = (seed: string) => `You generate a single short fortune.

### INSTRUCTIONS
1. Output exactly 1 sentence, 6-14 words.
2. Keep it professional but slightly witty/insightful.
3. Use the randomization seed to vary wording.
4. Output strictly valid JSON only.

### RANDOMIZATION SEED
${seed}

### RESPONSE FORMAT
{"fortune": "Your fortune here"}
`;

export async function generateFortuneResponse(): Promise<GenerateFortuneResponseOutput> {
  const seed = new Date().toISOString();
  const response = await generateAiText({
    systemPrompt: 'You are a concise fortune generator. Follow instructions exactly and output only valid JSON.',
    userPrompt: buildFortunePrompt(seed),
  });
  const parsed = JSON.parse(extractJsonPayload(response));
  const result = GenerateFortuneResponseOutputSchema.parse(parsed);
  const fortune = sanitizeFortune(result.fortune);
  if (!fortune) {
    throw new Error('Empty fortune response.');
  }
  return { fortune };
}
