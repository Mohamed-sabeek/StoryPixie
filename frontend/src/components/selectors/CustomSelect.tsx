import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  label: string;
  value: string | number;
  options: { label: string | number; value: string | number }[];
  onChange: (value: any) => void;
}

export default function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown if clicked outside of its container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="flex flex-col space-y-2 relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl border-2 transition-all duration-300 text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center ${
          isOpen 
            ? 'border-light-primary dark:border-dark-primary bg-white dark:bg-dark-surface shadow-sm' 
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:border-gray-300 dark:hover:border-gray-700'
        }`}
      >
        <span className="truncate mr-4">{selectedOption?.label}</span>
        <svg 
          className={`shrink-0 w-5 h-5 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-white dark:bg-dark-surface border-2 border-gray-100 dark:border-gray-800 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/50 overflow-hidden animate-fade-in-up">
          <ul className="max-h-60 overflow-y-auto p-2 no-scrollbar space-y-1">
            {options.map((opt) => (
              <li 
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 rounded-lg flex items-center cursor-pointer transition-colors duration-200 ${
                  value === opt.value 
                    ? 'bg-light-primary/10 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary font-semibold' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-medium'
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
