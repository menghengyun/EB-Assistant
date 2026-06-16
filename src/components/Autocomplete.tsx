import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { SKU } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AutocompleteProps {
  options: SKU[];
  onSelect: (sku: SKU) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  clearOnSelect?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  onSelect,
  placeholder = "Search SKU...",
  label,
  error,
  className,
  clearOnSelect = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SKU) => {
    onSelect(option);
    if (clearOnSelect) {
      setQuery('');
    } else {
      setQuery(option.sku);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter' && isOpen && filteredOptions[highlightedIndex]) {
      handleSelect(filteredOptions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative flex flex-col gap-1", className)} ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className={cn(
            "block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors",
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          )}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-12 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.map((option, index) => (
            <li
              key={option.sku}
              className={cn(
                "cursor-pointer select-none relative py-2 pl-3 pr-9",
                index === highlightedIndex ? "text-white bg-blue-600" : "text-gray-900 dark:text-gray-100"
              )}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">{option.sku}</span>
                <span className={cn(
                  "ml-2 truncate text-xs",
                  index === highlightedIndex ? "text-blue-100" : "text-gray-500"
                )}>
                  ${option.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query && filteredOptions.length === 0 && (
        <div className="absolute z-10 mt-12 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-3 px-4 text-sm text-gray-500 border border-gray-200 dark:border-gray-700">
          SKU not found
        </div>
      )}
    </div>
  );
};
