"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  allowCustom = false,
  className,
  disabled = false
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.toLowerCase().includes(lowerQuery)
    );
  }, [options, searchQuery]);

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setSearchQuery('');
  };

  const handleCustom = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim());
      setOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-slate-800 border-slate-600 text-white hover:bg-slate-700",
            !value && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-600">
        <div className="flex flex-col">
          {/* Search input */}
          <div className="flex items-center border-b border-slate-600 px-3 py-2">
            <Search className="h-4 w-4 mr-2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search options..."
              className="bg-slate-800 border-none text-white placeholder:text-gray-500 focus-visible:ring-0"
            />
          </div>

          {/* Options list */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors",
                      value === option && "bg-yellow-500/20 text-yellow-300"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-sm">
                No options found
              </div>
            )}

            {/* Custom option */}
            {allowCustom && searchQuery && !filteredOptions.includes(searchQuery) && (
              <div className="border-t border-slate-600 p-2">
                <button
                  onClick={handleCustom}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add &quot;{searchQuery}&quot; as custom option
                </button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

