'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Lightbulb, HelpCircle, Code2, Wrench } from 'lucide-react';

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
      icon: Code2,
      label: 'Explain my query',
      prompt: `Please explain what this SQL query does step by step:\n\n${currentQuery}`,
    },
    {
      icon: Wrench,
      label: 'Help fix this',
      prompt: `I got this error: "${errorMessage}"\n\nWith this query:\n${currentQuery}\n\nCan you help me fix it?`,
      show: !!errorMessage,
    },
    {
      icon: Lightbulb,
      label: 'Give me a hint',
      prompt: `I'm working on this lesson: "${lessonTitle}". Can you give me a hint for the challenge without giving away the answer?`,
    },
    {
      icon: HelpCircle,
      label: 'Explain concept',
      prompt: `Can you explain the concept covered in this lesson: "${lessonTitle}"?`,
    },
  ];

  return (
    <div className={className}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 bottom-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
          isOpen
            ? 'bg-slate-700 text-slate-300'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        <span className="font-medium">{isOpen ? 'Close' : 'AI Tutor'}</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-4 bottom-20 z-50 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              AI SQL Tutor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ask me anything about SQL!</p>
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2 border-b border-slate-700 flex flex-wrap gap-2">
            {quickActions
              .filter((action) => action.show !== false)
              .map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors disabled:opacity-50"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">
                Ask a question or use the quick actions above to get help with SQL.
              </p>
            )}

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <MessageContent content={message.content} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
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
