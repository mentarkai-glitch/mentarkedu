"use client";

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, CheckCircle } from 'lucide-react';
import { SearchableSelect } from './inputs/SearchableSelect';
import { MultiSelectChips } from './inputs/MultiSelectChips';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import { ConditionalQuestion } from './inputs/ConditionalQuestion';
import { useARKChatStore } from '@/lib/stores/ark-chat-store';
import { getMergedSuggestions } from '@/lib/services/ark-suggestion-service';
import { getAllSuggestions } from '@/lib/data/ark-suggestions';
import { 
  getCategoryQuestions,
  getQuestionSequence,
  type ARKQuestion
} from '@/lib/data/ark-questions';
import { shouldShowQuestion } from '@/lib/services/ark-question-orchestrator';

interface DeepDiveQuestionsStepProps {
  categoryId: string;
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, value: any) => void;
  onComplete: () => void;
}

export function DeepDiveQuestionsStep({
  categoryId,
  answers,
  onAnswerChange,
  onComplete
}: DeepDiveQuestionsStepProps) {
  const questions = getCategoryQuestions(categoryId);
  const coreQuestions = questions?.core || [];
  const progressiveQuestions = questions?.progressive || [];
  const allQuestions = [...coreQuestions, ...progressiveQuestions];

  // Render question based on type
  const renderQuestion = (question: ARKQuestion) => {
    const isVisible = shouldShowQuestion(question, answers);
    const currentValue = answers[question.id];

    if (!isVisible) return null;

    return (
      <ConditionalQuestion key={question.id} question={question} show={isVisible}>
        <div className="space-y-3">
          <Label className="text-white text-lg font-medium flex items-center gap-2">
            {question.question}
            {question.required && <span className="text-red-400">*</span>}
            {question.helpText && (
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-white rounded-lg border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {question.helpText}
                </div>
              </div>
            )}
          </Label>

          {renderInput(question, currentValue)}
        </div>
      </ConditionalQuestion>
    );
  };

  const renderInput = (question: ARKQuestion, value: any) => {
    switch (question.type) {
      case 'searchable-select':
        return (
          <SearchableSelect
            value={value || ''}
            onChange={(val) => onAnswerChange(question.id, val)}
            options={getOptionsForQuestion(question)}
            placeholder={question.placeholder}
            allowCustom={question.allowCustom}
          />
        );

      case 'multi-select-chips':
        return (
          <MultiSelectChips
            value={value || []}
            onChange={(val) => onAnswerChange(question.id, val)}
            options={getOptionsForQuestion(question)}
            max={question.max}
            allowCustom={question.allowCustom}
          />
        );

      case 'text':
      case 'textarea':
        const InputComponent = question.type === 'textarea' ? Textarea : 'input' as any;
        return (
          <InputComponent
            value={value || ''}
            onChange={(e: any) => onAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full bg-slate-800 border-slate-600 text-white"
            required={question.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full bg-slate-800 border-slate-600 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required={question.required}
          />
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{question.min}</span>
              <span className="text-yellow-400 font-semibold">{value || question.default}</span>
              <span className="text-gray-400 text-sm">{question.max}</span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={value || question.default}
              onChange={(e) => onAnswerChange(question.id, Number(e.target.value))}
              className="w-full"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const getOptionsForQuestion = (question: ARKQuestion): string[] => {
    if (!question.suggestions) return [];
    
    const [category, type] = question.suggestions.split('.');
    const suggestions = getAllSuggestions(categoryId);
    return suggestions[type] || [];
  };

  // Calculate progress
  const totalQuestions = allQuestions.length;
  const answeredQuestions = Object.keys(answers).filter(key => answers[key]).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Tell Us More About Your Goal
        </h2>
        <p className="text-xl text-gray-300">
          The more details you share, the better we can personalize your ARK.
        </p>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {answeredQuestions} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {allQuestions.map(q => renderQuestion(q))}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <p className="text-yellow-100 text-sm">
          <strong>Tip:</strong> You don&apos;t need to answer every question. Focus on the ones that are most relevant to your situation!
        </p>
      </div>
    </div>
  );
}

