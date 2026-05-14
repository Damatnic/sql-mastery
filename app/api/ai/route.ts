import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SCHEMA_DESCRIPTIONS } from '@/lib/databases';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: {
    lessonTitle: string;
    currentQuery: string;
    errorMessage?: string;
    database: string;
  };
}

const SYSTEM_PROMPT = `You are a SQL tutor helping someone learn SQL while taking a college course. Keep answers short and direct. Don't over-explain.

- Use code blocks for SQL
- When there's an error, quote the broken part and show the fix
- For hints, push them toward the answer without giving it away
- All exercises run on SQLite in the browser. Mention SQL Server differences only when it matters for the lesson topic
- Don't say things like "Great question!" or add encouragement filler

Current context:
- Lesson: {lessonTitle}
- Database schema: {schemaDescription}
- Current query: {currentQuery}
{errorContext}`;

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { messages, context } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
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
