import 'server-only';

import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateTextOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

let clientSingleton: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (clientSingleton) return clientSingleton;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  clientSingleton = new OpenAI({ apiKey });
  return clientSingleton;
}

export async function generateText(
  messages: ChatMessage[],
  options?: GenerateTextOptions
): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: options?.model ?? 'gpt-4o-mini',
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 1024,
    messages,
  });

  const content = response.choices?.[0]?.message?.content ?? '';
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }
  return content;
}

export async function simplePrompt(prompt: string, options?: GenerateTextOptions): Promise<string> {
  return generateText(
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    options
  );
}
