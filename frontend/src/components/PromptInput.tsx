import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, placeholder, disabled }) => {
  return (
    <div className="w-full max-w-3xl">
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || "Describe your story idea... e.g., 'A lonely robot exploring a garden on Mars'"}
        className="w-full h-32 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface focus:border-light-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 outline-none transition-all duration-300 resize-none text-lg text-light-text dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
  );
};

export default PromptInput;
