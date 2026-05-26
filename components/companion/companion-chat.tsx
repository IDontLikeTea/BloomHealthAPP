'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, ArrowLeft, Check, Pencil, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MealProposal {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CompanionChatProps {
  initialContext: {
    companionName: string;
    profile: any;
    todaySummary: any;
    recentMessages: any[];
  };
}

function parseMealProposal(text: string): MealProposal | null {
  const proposalMatch = text.match(/---MEAL_PROPOSAL---([\s\S]*?)---END_PROPOSAL---/);
  if (!proposalMatch) return null;
  const block = proposalMatch[1];
  const get = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`, 'i'));
    return m ? m[1].trim() : '';
  };
  const calories = parseInt(get('Calories')) || 0;
  if (!calories) return null;
  return {
    name: get('Name') || 'Meal',
    type: (get('Type') || 'snack').toLowerCase(),
    calories,
    protein: parseInt(get('Protein')) || 0,
    carbs: parseInt(get('Carbs')) || 0,
    fat: parseInt(get('Fat')) || 0,
  };
}

function parseConfirmedMeal(text: string): MealProposal | null {
  const confirmMatch = text.match(/---LOG_CONFIRMED---([\s\S]*?)---END_CONFIRMED---/);
  if (!confirmMatch) return null;
  const block = confirmMatch[1];
  const get = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`, 'i'));
    return m ? m[1].trim() : '';
  };
  const calories = parseInt(get('Calories')) || 0;
  if (!calories) return null;
  return {
    name: get('Name') || 'Meal',
    type: (get('Type') || 'snack').toLowerCase(),
    calories,
    protein: parseInt(get('Protein')) || 0,
    carbs: parseInt(get('Carbs')) || 0,
    fat: parseInt(get('Fat')) || 0,
  };
}

function cleanMessageContent(text: string): string {
  // Remove the raw markers from displayed text
  let cleaned = text
    .replace(/---MEAL_PROPOSAL---[\s\S]*?---END_PROPOSAL---/g, '')
    .replace(/---LOG_CONFIRMED---[\s\S]*?---END_CONFIRMED---/g, '')
    .trim();
  return cleaned;
}

function MealProposalCard({ proposal, onConfirm, onEdit, logging }: {
  proposal: MealProposal;
  onConfirm: () => void;
  onEdit: () => void;
  logging: boolean;
}) {
  return (
    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-800">Meal Estimate</span>
      </div>
      <div className="text-sm text-emerald-900 space-y-1">
        <p className="font-medium">{proposal.name}</p>
        <p className="text-emerald-700 capitalize text-xs">{proposal.type}</p>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="text-center bg-white rounded px-2 py-1">
            <p className="text-xs text-gray-500">Cal</p>
            <p className="font-semibold text-sm tabular-nums">{proposal.calories}</p>
          </div>
          <div className="text-center bg-white rounded px-2 py-1">
            <p className="text-xs text-gray-500">Protein</p>
            <p className="font-semibold text-sm tabular-nums">{proposal.protein}g</p>
          </div>
          <div className="text-center bg-white rounded px-2 py-1">
            <p className="text-xs text-gray-500">Carbs</p>
            <p className="font-semibold text-sm tabular-nums">{proposal.carbs}g</p>
          </div>
          <div className="text-center bg-white rounded px-2 py-1">
            <p className="text-xs text-gray-500">Fat</p>
            <p className="font-semibold text-sm tabular-nums">{proposal.fat}g</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onConfirm}
          disabled={logging}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {logging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {logging ? 'Logging...' : 'Log This'}
        </button>
        <button
          onClick={onEdit}
          disabled={logging}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
}

function LoggedMealCard({ proposal }: { proposal: MealProposal }) {
  return (
    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Check className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-semibold text-gray-800">Meal Logged</span>
      </div>
      <p className="text-sm text-gray-700">{proposal.name} — {proposal.calories} cal</p>
    </div>
  );
}

export function CompanionChat({ initialContext }: CompanionChatProps) {
  const { companionName, profile, todaySummary, recentMessages } = initialContext;
  const [messages, setMessages] = useState<Message[]>(
    (recentMessages ?? []).map((m: any) => ({
      id: m?.id ?? Math.random().toString(),
      role: m?.role ?? 'user',
      content: m?.content ?? '',
    }))
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [loggingMeal, setLoggingMeal] = useState(false);
  const [loggedProposals, setLoggedProposals] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const logMealFromProposal = useCallback(async (proposal: MealProposal, messageId: string) => {
    setLoggingMeal(true);
    try {
      const res = await fetch('/api/ai/agent-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal),
      });
      if (!res.ok) throw new Error('Failed to log meal');
      setLoggedProposals(prev => new Set(prev).add(messageId));
      toast.success(`${proposal.name} logged (${proposal.calories} cal)`);
    } catch (err) {
      toast.error('Failed to log meal');
    } finally {
      setLoggingMeal(false);
    }
  }, []);

  const sendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreaming(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          companionName,
          context: {
            goalType: profile?.goalType,
            calorieGoal: profile?.calorieGoal,
            todaySummary,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed?.choices?.[0]?.delta?.content ?? '';
                fullContent += content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: fullContent } : m
                  )
                );
              } catch (e) {}
            }
          }
        }
      }

      // Auto-log if the AI confirmed
      const confirmed = parseConfirmedMeal(fullContent);
      if (confirmed) {
        // Auto-log without needing button click
        setLoggingMeal(true);
        try {
          const res = await fetch('/api/ai/agent-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(confirmed),
          });
          if (res.ok) {
            setLoggedProposals(prev => new Set(prev).add(assistantMessageId));
            toast.success(`${confirmed.name} logged (${confirmed.calories} cal)`);
          }
        } catch (err) {
          console.error('Auto-log error:', err);
        } finally {
          setLoggingMeal(false);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: 'I\'m having trouble connecting right now. Please try again in a moment.' }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const quickPrompts = [
    "I just had a chicken sandwich",
    'Give me a healthy snack idea',
    'What should I focus on today?',
    'Help me plan my meals',
  ];

  const renderMessageContent = (message: Message) => {
    const proposal = parseMealProposal(message.content);
    const confirmedMeal = parseConfirmedMeal(message.content);
    const cleanText = cleanMessageContent(message.content);
    const isLogged = loggedProposals.has(message.id);

    return (
      <>
        {cleanText && <p className="whitespace-pre-wrap leading-relaxed">{cleanText}</p>}
        {confirmedMeal || isLogged ? (
          <LoggedMealCard proposal={confirmedMeal || proposal!} />
        ) : proposal ? (
          <MealProposalCard
            proposal={proposal}
            onConfirm={() => logMealFromProposal(proposal, message.id)}
            onEdit={() => {
              setInput('Actually, ');
              inputRef.current?.focus();
            }}
            logging={loggingMeal}
          />
        ) : null}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-gray-900">{companionName ?? 'Sage'}</h1>
            <p className="text-xs text-gray-500">AI Health Assistant — can log meals for you</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        {(messages ?? []).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Chat with {companionName ?? 'Sage'}</h2>
            <p className="text-gray-500 mb-2 max-w-sm mx-auto text-sm">
              Your AI health assistant. Ask about nutrition, or tell me what you ate and I will log it for you.
            </p>
            <p className="text-xs text-gray-400 mb-6">Try saying what you ate — I will estimate the nutrition and log it.</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-3">Try...</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(undefined, prompt)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {(messages ?? []).map((message) => (
                <motion.div
                  key={message?.id ?? Math.random()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message?.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-xl text-sm ${
                      message?.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {message?.role === 'assistant'
                      ? renderMessageContent(message)
                      : <p className="whitespace-pre-wrap leading-relaxed">{message?.content ?? ''}</p>
                    }
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {streaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-400 text-xs"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                {companionName ?? 'Sage'} is typing...
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-16 lg:bottom-0 bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you ate, or ask anything..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-emerald-600 rounded-lg text-white disabled:opacity-50 hover:bg-emerald-700 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
