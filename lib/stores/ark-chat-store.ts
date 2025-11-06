/**
 * ARK Chat Store
 * Zustand store for managing Ask Mentark chat state
 */

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: FieldSuggestion[];
}

export interface FieldSuggestion {
  fieldId: string;
  fieldName: string;
  suggestedValue: any;
  confidence?: number;
}

export interface ChatContext {
  currentStep?: number;
  categoryId?: string;
  currentQuestions?: string[];
  userAnswers?: Record<string, any>;
}

interface ChatStore {
  // State
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  context: ChatContext;
  
  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setContext: (context: Partial<ChatContext>) => void;
  setLoading: (loading: boolean) => void;
}

export const useARKChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  isOpen: false,
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m Mentark. I\'m here to help you create the perfect ARK. You can ask me anything about your goals, and I\'ll guide you through the process!',
      timestamp: new Date()
    }
  ],
  isLoading: false,
  context: {},
  
  // Actions
  openChat: () => set({ isOpen: true }),
  
  closeChat: () => set({ isOpen: false }),
  
  toggleChat: () => set(state => ({ isOpen: !state.isOpen })),
  
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...message
    };
    set(state => ({ 
      messages: [...state.messages, newMessage] 
    }));
  },
  
  clearMessages: () => {
    set({ 
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m Mentark. I\'m here to help you create the perfect ARK. You can ask me anything about your goals, and I\'ll guide you through the process!',
        timestamp: new Date()
      }] 
    });
  },
  
  setContext: (context) => {
    set(state => ({ 
      context: { ...state.context, ...context } 
    }));
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  sendMessage: async (content: string) => {
    const state = get();
    
    // Add user message
    state.addMessage({ role: 'user', content });
    state.setLoading(true);
    
    try {
      // Call chat API
      const response = await fetch('/api/ark-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: state.context,
          conversationHistory: state.messages.slice(-5) // Last 5 messages for context
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add assistant response
        state.addMessage({
          role: 'assistant',
          content: data.data.response,
          suggestions: data.data.suggestions
        });
      } else {
        // Error response
        state.addMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Could you try rephrasing your question?'
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      state.addMessage({
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again in a moment.'
      });
    } finally {
      state.setLoading(false);
    }
  }
}));

