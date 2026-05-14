'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorProps {
  lessonTitle: string;
  database: string;
  currentQuery: string;
  errorMessage?: string;
  className?: string;
}

export default function AITutor({
  lessonTitle,
  database,
  currentQuery,
  errorMessage,
  className = '',
}: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = { role: 'user', content };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            context: {
              lessonTitle,
              currentQuery,
              errorMessage,
              database,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content || 'Sorry, I could not process that request.',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, lessonTitle, currentQuery, errorMessage, database]
  );

  const quickActions = [
    {
      label: 'explain query',
      prompt: `Please explain what this SQL query does step by step:\n\n${currentQuery}`,
    },
    {
      label: 'fix error',
      prompt: `I got this error: "${errorMessage}"\n\nWith this query:\n${currentQuery}\n\nCan you help me fix it?`,
      show: !!errorMessage,
    },
    {
      label: 'hint',
      prompt: `I'm working on this lesson: "${lessonTitle}". Can you give me a hint for the challenge without giving away the answer?`,
    },
    {
      label: 'explain concept',
      prompt: `Can you explain the concept covered in this lesson: "${lessonTitle}"?`,
    },
  ];

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 bottom-4 z-50 px-3 py-1.5 rounded border font-mono text-xs shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isOpen
            ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100'
            : 'border-indigo-400 bg-slate-900 text-indigo-400 hover:bg-indigo-400/10'
        }`}
        aria-label={isOpen ? 'Close AI tutor' : 'Open AI tutor'}
      >
        {isOpen ? 'close' : '$ ./ai-tutor'}
      </button>

      {isOpen && (
        <div
          className="fixed right-4 bottom-20 z-50 w-96 h-[500px] bg-slate-950 border border-slate-800 rounded shadow-2xl flex flex-col overflow-hidden font-mono text-sm"
          role="dialog"
          aria-label="AI tutor"
        >
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-slate-100">
              <span className="text-indigo-400">&gt; </span>ai-tutor
            </p>
            <p className="mt-1 text-xs text-slate-500"># ask about the current lesson or your query.</p>
          </div>

          <div className="px-3 py-2 border-b border-slate-800 flex flex-wrap gap-2">
            {quickActions
              .filter((action) => action.show !== false)
              .map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs rounded border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-600 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  cmd: {action.label}
                </button>
              ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {messages.length === 0 && (
              <p className="text-slate-500 text-center py-8">
                # ask a question or pick a command above
              </p>
            )}

            {messages.map((message, idx) => (
              <div key={idx} className="space-y-1">
                <p className={message.role === 'user' ? 'text-indigo-400' : 'text-slate-500'}>
                  {message.role === 'user' ? 'you' : 'tutor'} <span className="text-slate-600">$</span>
                </p>
                <div className={message.role === 'user' ? 'text-slate-200 pl-3' : 'text-slate-300 pl-3'}>
                  <MessageContent content={message.content} />
                </div>
              </div>
            ))}

            {isLoading && (
              <p className="text-slate-500">tutor $ <span className="terminal-cursor inline-block w-2 h-3 align-text-bottom bg-slate-500" aria-hidden="true" /></p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="ask a question…"
                aria-label="Question for AI tutor"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="px-2 py-1 rounded border border-indigo-400 text-indigo-400 hover:bg-indigo-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple parsing for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
          return (
            <pre
              key={idx}
              className="bg-slate-900 rounded p-2 overflow-x-auto text-xs font-mono text-slate-300"
            >
              {code}
            </pre>
          );
        }
        return (
          <span key={idx} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </div>
  );
}
