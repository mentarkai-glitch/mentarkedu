"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useARKChatStore } from '@/lib/stores/ark-chat-store';

interface AskMentarkChatProps {
  categoryId?: string;
  currentStep?: number;
  userAnswers?: Record<string, any>;
}

export function AskMentarkChat({ 
  categoryId, 
  currentStep, 
  userAnswers 
}: AskMentarkChatProps) {
  const {
    isOpen,
    messages,
    isLoading,
    openChat,
    closeChat,
    sendMessage,
    setContext
  } = useARKChatStore();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionLibrary: Record<number, string[]> = {
    1: [
      "Help me summarise my target outcome for this ARK.",
      "Suggest Indian exam milestones I should mention.",
    ],
    2: [
      "List common blockers for students in Maharashtra with this goal.",
      "What metrics should I track weekly for this ARK?",
    ],
    3: [
      "Draft strong deep-dive answers for competitive exam prep.",
      "How do I describe my constraints like budget and study hours?",
    ],
    4: [
      "What cultural or language context should I highlight?",
      "Recommend mentorship styles suited to my institute type.",
    ],
  };

  const activeSuggestions = suggestionLibrary[currentStep ?? 1] ?? suggestionLibrary[1];

  // Update context when props change
  useEffect(() => {
    setContext({
      categoryId,
      currentStep,
      userAnswers
    });
  }, [categoryId, currentStep, userAnswers, setContext]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={openChat}
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 w-full sm:w-96 h-[600px] z-50 bg-slate-900 border-l border-yellow-500/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-b border-yellow-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ask Mentark</h3>
                  <p className="text-xs text-yellow-400">AI Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="h-8 w-8 hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-gray-400" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 space-y-2"
                  >
                    <p className="font-semibold text-yellow-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Prompt ideas for this step
                    </p>
                    <div className="flex flex-col gap-2">
                      {activeSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setInputValue(suggestion);
                            inputRef.current?.focus();
                          }}
                          className="text-left rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-xs hover:border-yellow-400 hover:text-yellow-200 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                        : 'bg-slate-800 text-gray-100 border border-slate-700'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                          <p className="text-xs font-semibold mb-1">Suggestions:</p>
                          {message.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="text-xs text-yellow-300">
                              • {suggestion.fieldName}: {String(suggestion.suggestedValue)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700">
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-slate-700 p-4 bg-slate-900/50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

