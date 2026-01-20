import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateFortuneResponse } from './generate-fortune-response';
import { generateAiText } from '@/ai/client';

vi.mock('@/ai/client', () => ({
  generateAiText: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(generateAiText).mockReset();
});

describe('generateFortuneResponse', () => {
  it('sanitizes quoted fortune responses', async () => {
    vi.mocked(generateAiText).mockResolvedValue('{"fortune":"\\"Stay sharp\\""}');

    const result = await generateFortuneResponse();

    expect(result.fortune).toBe('Stay sharp');
  });

  it('trims fortunes to the max length', async () => {
    const longFortune = 'a'.repeat(200);
    vi.mocked(generateAiText).mockResolvedValue(`{"fortune":"${longFortune}"}`);

    const result = await generateFortuneResponse();

    expect(result.fortune.length).toBeLessThanOrEqual(140);
  });
});
