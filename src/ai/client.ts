import 'server-only';
import {headers} from 'next/headers';

export type AiProvider = 'gemini' | 'openai' | 'deepseek' | 'grok';

type ProviderKind = 'openai' | 'gemini';

type ProviderConfig = {
  id: AiProvider;
  label: string;
  kind: ProviderKind;
  apiKeyEnv: string;
  modelEnv: string;
  defaultModel: string;
  endpoint: string;
};

type GenerateTextInput = {
  systemPrompt?: string;
  userPrompt: string;
  provider?: AiProvider;
};

export type AiStatus = {
  provider: AiProvider;
  label: string;
  configured: boolean;
};

const PROVIDERS: Record<AiProvider, ProviderConfig> = {
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    kind: 'gemini',
    apiKeyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    defaultModel: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    kind: 'openai',
    apiKeyEnv: 'OPENAI_API_KEY',
    modelEnv: 'OPENAI_MODEL',
    defaultModel: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    kind: 'openai',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    modelEnv: 'DEEPSEEK_MODEL',
    defaultModel: 'deepseek-chat',
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
  grok: {
    id: 'grok',
    label: 'xAI Grok',
    kind: 'openai',
    apiKeyEnv: 'XAI_API_KEY',
    modelEnv: 'XAI_MODEL',
    defaultModel: 'grok-4',
    endpoint: 'https://api.x.ai/v1/chat/completions',
  },
};

const cooldownMs = Number.parseInt(process.env.AI_COOLDOWN_MS ?? '120000', 10);
const cooldownMap = new Map<string, number>();

const resolveProvider = (provider?: AiProvider): AiProvider => {
  if (provider && PROVIDERS[provider]) return provider;
  const envProvider = process.env.AI_PROVIDER?.toLowerCase();
  if (envProvider && envProvider in PROVIDERS) return envProvider as AiProvider;
  return 'gemini';
};

const getClientIdentifier = async () => {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const realIp = requestHeaders.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? realIp?.trim();
  return ip || 'anonymous';
};

const getModelName = (config: ProviderConfig) =>
  process.env[config.modelEnv] || config.defaultModel;

const getApiKey = (config: ProviderConfig) => {
  const key = process.env[config.apiKeyEnv];
  if (!key) {
    throw new Error(`Missing ${config.apiKeyEnv}.`);
  }
  return key;
};

const parseOpenAiResponse = (data: unknown, providerLabel: string) => {
  const response = data as {
    choices?: Array<{message?: {content?: string | null}} | null>;
  };
  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error(`Empty response from ${providerLabel}.`);
  }
  return content;
};

const parseGeminiResponse = (data: unknown, providerLabel: string) => {
  const response = data as {
    candidates?: Array<{
      content?: {parts?: Array<{text?: string | null} | null> | null} | null;
    } | null>;
  };
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const content = parts.map(part => part?.text ?? '').join('').trim();
  if (!content) {
    throw new Error(`Empty response from ${providerLabel}.`);
  }
  return content;
};

const requestOpenAiLike = async (
  config: ProviderConfig,
  input: GenerateTextInput,
  apiKey: string,
  model: string
) => {
  const messages: Array<{role: 'system' | 'user'; content: string}> = [];
  if (input.systemPrompt) {
    messages.push({role: 'system', content: input.systemPrompt});
  }
  messages.push({role: 'user', content: input.userPrompt});

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Provider ${config.label} error: ${response.status}.`);
  }
  return parseOpenAiResponse(data, config.label);
};

const requestGemini = async (
  config: ProviderConfig,
  input: GenerateTextInput,
  apiKey: string,
  model: string
) => {
  const response = await fetch(
    `${config.endpoint}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{text: input.userPrompt}],
          },
        ],
        systemInstruction: input.systemPrompt
          ? {
              role: 'system',
              parts: [{text: input.systemPrompt}],
            }
          : undefined,
        generationConfig: {
          temperature: 0.3,
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Provider ${config.label} error: ${response.status}.`);
  }
  return parseGeminiResponse(data, config.label);
};

export const generateAiText = async (input: GenerateTextInput) => {
  const provider = resolveProvider(input.provider);
  const config = PROVIDERS[provider];
  const apiKey = getApiKey(config);
  const model = getModelName(config);

  if (config.kind === 'gemini') {
    return requestGemini(config, input, apiKey, model);
  }
  return requestOpenAiLike(config, input, apiKey, model);
};

export const getAiStatus = (): AiStatus => {
  const provider = resolveProvider();
  const config = PROVIDERS[provider];
  return {
    provider,
    label: config.label,
    configured: Boolean(process.env[config.apiKeyEnv]),
  };
};

export const enforceAiCooldown = async (action: string) => {
  if (!Number.isFinite(cooldownMs) || cooldownMs <= 0) return;
  const key = `${await getClientIdentifier()}:${action}`;
  const now = Date.now();
  const lastRequest = cooldownMap.get(key);
  if (lastRequest && now - lastRequest < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - (now - lastRequest)) / 1000);
    throw new Error(`AI_COOLDOWN:${remainingSeconds}`);
  }
  cooldownMap.set(key, now);
};
