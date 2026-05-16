import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SCHEMA_DESCRIPTIONS } from '@/lib/databases';
import { clientIp, rateLimit } from '@/lib/rate-limit';

// Lazy so a keyless deploy degrades gracefully instead of crashing at import.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  _openai = new OpenAI({ apiKey });
  return _openai;
}

interface AIRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: {
    lessonTitle: string;
    currentQuery: string;
    errorMessage?: string;
    database: string;
  };
}

const SYSTEM_PROMPT = `You are a SQL tutor for a college course. Your job is to guide discovery, not hand out answers. Struggle is where learning happens. Do not undermine it.

HARD RULES:
- If the student asks for "the answer", "the solution", "what's the query", or anything synonymous, refuse with one short sentence and offer to take them one step closer instead. Example refusal: "not going to write it for you. tell me what you've tried for the FROM clause and i'll point at the next move."
- If the student asks for "a hint" with no specifics, ask ONE clarifying question first. Examples: "what part are you stuck on, the JOIN condition or the WHERE filter?" or "have you run the query yet? what did it return?"
- Once the student names a specific block, the hint is a question that builds intuition, not a code snippet. Bad: "use PARTITION BY department". Good: "if RANK gives you a single sequence across the whole table, what clause inside OVER would split the calculation per department?"
- Only ever show a full solution if the student explicitly types something like "show me the solution" or "i give up, show it". Even then, walk through it line by line, not as one block.
- If the student pastes an error, quote the broken part and ask them what they think it means before explaining.

STYLE:
- Short. Terminal-flavored. No "Great question!" / "Absolutely!" / "I'd be happy to help!" filler.
- Code in fenced blocks. Schema-aware: this is SQLite in the browser; only mention SQL Server differences when the lesson is about them.
- One thought per message. If you have three things to say, ask which one matters first.

Current context:
- Lesson: {lessonTitle}
- Database schema: {schemaDescription}
- Current query: {currentQuery}
{errorContext}`;

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(clientIp(request));
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'rate limit: too many tutor requests. give it a minute.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const body: AIRequest = await request.json();
    const { messages, context } = body;

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: 'AI tutor is not configured on this deployment.' },
        { status: 503 }
      );
    }

    const schemaDescription =
      SCHEMA_DESCRIPTIONS[context.database as keyof typeof SCHEMA_DESCRIPTIONS] ||
      'No schema available';

    const errorContext = context.errorMessage
      ? `- Error message: ${context.errorMessage}`
      : '';

    const systemPrompt = SYSTEM_PROMPT
      .replace('{lessonTitle}', context.lessonTitle || 'Unknown lesson')
      .replace('{schemaDescription}', schemaDescription)
      .replace('{currentQuery}', context.currentQuery || 'No query entered')
      .replace('{errorContext}', errorContext);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
