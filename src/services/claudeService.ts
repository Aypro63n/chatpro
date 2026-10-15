import Anthropic from '@anthropic-ai/sdk';
import type { Message as ChatMessage } from '../types';

/**
 * Claude assistant integration.
 *
 * The API key is read from import.meta.env.VITE_ANTHROPIC_API_KEY at runtime.
 * NOTE: any VITE_* value ships inside the client bundle, so anyone who opens
 * devtools can read it. For production, proxy this call through a server
 * function (Vercel /api route) that holds the key privately. Until then, set
 * a low spend limit on the key in the Anthropic console.
 */

const SYSTEM_PROMPT = `You are ChatPro Assistant, embedded in a real-time chat product.
Reply in plain text. Never use markdown syntax, headings, bullet characters or emoji.
Keep answers under 120 words unless the user asks for detail. Be direct and factual.`

let clientPromise: Promise<Anthropic | null> | null = null;

const getClient = async (): Promise<Anthropic | null> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) return null;
  if (!clientPromise) {
    clientPromise = import('@anthropic-ai/sdk').then(({ default: Sdk }) => {
      return new Sdk({ apiKey });
    });
  }
  return clientPromise;
}

export const isClaudeConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);

/** Map stored ChatPro messages into Anthropic turns, skipping the assistant's own history noise. */
const toAnthropicMessages = (history: ChatMessage[], userId: string) => {
  const turns: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of history.slice(-24)) {
    if (m.deleted || !m.content?.trim()) continue;
    if (m.senderId === 'chatpro_assistant') {
      turns.push({ role: 'assistant', content: m.content });
    } else if (m.senderId === userId && m.type === 'text') {
      turns.push({ role: 'user', content: m.content });
    }
  }
  // Anthropic requires the first turn to be "user".
  while (turns.length && turns[0].role !== 'user') turns.shift();
  return turns;
};

export const generateClaudeReply = async (
  userText: string,
  history: ChatMessage[],
  userId: string,
): Promise<string> => {
  const client = await getClient();
  if (!client) {
    throw new Error('Assistant is not configured yet. Set VITE_ANTHROPIC_API_KEY.');
  }

  const messages = toAnthropicMessages(history, userId);
  if (!messages.length || messages[messages.length - 1].content !== userText.trim()) {
    messages.push({ role: 'user', content: userText.trim() });
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text.trim() : '';
};
