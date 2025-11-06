"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  placeholder?: string;
  max?: number;
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectChips({
  value = [],
  onChange,
  options = [],
  placeholder = 'Select options...',
  max,
  allowCustom = false,
  className,
  disabled = false
}: MultiSelectChipsProps) {
  const [customInput, setCustomInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      // Remove
      onChange(value.filter(v => v !== option));
    } else {
      // Add (check max limit)
      if (!max || value.length < max) {
        onChange([...value, option]);
      }
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim() && !value.includes(customInput.trim())) {
      if (!max || value.length < max) {
        onChange([...value, customInput.trim()]);
      }
      setCustomInput('');
      setIsAddingCustom(false);
    }
  };

  const availableOptions = options.filter(opt => !value.includes(opt));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1.5 flex items-center gap-2"
            >
              {item}
              <button
                onClick={() => handleToggle(item)}
                className="hover:text-yellow-400 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Options grid */}
      {!isAddingCustom && availableOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableOptions.map((option) => (
            <Button
              key={option}
              onClick={() => handleToggle(option)}
              variant="outline"
              disabled={disabled || (max ? value.length >= max : false)}
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-yellow-500"
            >
              {option}
            </Button>
          ))}
        </div>
      )}

      {/* Add custom option */}
      {allowCustom && !isAddingCustom && (max ? value.length < max : true) && (
        <Button
          onClick={() => setIsAddingCustom(true)}
          variant="outline"
          disabled={disabled}
          className="w-full bg-slate-800 border-slate-600 text-yellow-400 hover:bg-slate-700 hover:border-yellow-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Option
        </Button>
      )}

      {/* Custom input */}
      {isAddingCustom && (
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter custom option..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              } else if (e.key === 'Escape') {
                setIsAddingCustom(false);
                setCustomInput('');
              }
            }}
            className="bg-slate-800 border-slate-600 text-white"
            autoFocus
          />
          <Button
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
          >
            Add
          </Button>
          <Button
            onClick={() => {
              setIsAddingCustom(false);
              setCustomInput('');
            }}
            variant="outline"
            className="border-slate-600"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Max limit message */}
      {max && value.length >= max && (
        <p className="text-xs text-yellow-400">
          Maximum {max} selections reached
        </p>
      )}
    </div>
  );
}

