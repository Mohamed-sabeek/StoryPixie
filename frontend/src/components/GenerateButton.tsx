import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  text: string;
  disabled?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, isLoading, text, disabled = false }) => {
  const isDisabled = isLoading || disabled;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`btn-primary flex items-center justify-center gap-2 min-w-[200px] ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white dark:text-dark-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default GenerateButton;
