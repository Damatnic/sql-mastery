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

const SYSTEM_PROMPT = `You are an expert SQL tutor helping a student learn SQL from scratch. You are friendly, patient, and encouraging.

Your role is to:
1. Explain SQL concepts clearly with examples
2. Help debug SQL errors by explaining what went wrong
3. Give hints that guide thinking without giving away answers
4. Break down complex queries step by step

Guidelines:
- Be concise but thorough
- Use code blocks for SQL examples
- When explaining errors, quote the problematic part and show the fix
- For hints, guide them to think through the problem rather than giving the answer directly
- Remember that the student is running queries against SQLite in the browser
- Reference SQL Server syntax when discussing real-world applications, but SQLite for the exercises

Current context:
- Lesson: {lessonTitle}
- Database schema: {schemaDescription}
- Student's current query: {currentQuery}
{errorContext}

Help the student succeed!`;

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
