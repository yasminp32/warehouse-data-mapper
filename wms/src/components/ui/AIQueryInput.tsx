import React, { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { Power2, gsap } from 'gsap';
import FadeIn from '@/components/animations/FadeIn';

interface AIQueryInputProps {
  onSubmit: (query: string) => void;
}

const AIQueryInput: React.FC<AIQueryInputProps> = ({ onSubmit }) => {
  const [query, setQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = event.target.value;
    const sanitizedText = inputText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    setQuery(sanitizedText);
    setError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!query || query.trim() === '') {
      setError('Query cannot be empty.');
      return;
    }

    try {
      onSubmit(query);
      setQuery('');
      setError(null);
    } catch (e: any) {
      console.error('Error submitting query:', e);
      setError(`Failed to submit query: ${e.message}`);
    }
  }, [onSubmit, query]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <FadeIn>
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Enter your query..."
          className="w-full p-2 border rounded text-darkGray font-open-sans"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="AI Query Input"
        />
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="medium"
          disabled={!query}
          ariaLabel="Submit AI Query"
        >
          Submit
        </Button>
      </div>
      {error && (
        <div className="text-red-500 font-open-sans text-center mt-2">{`Error: ${error}`}</div>
      )}
    </FadeIn>
  );
};

export default AIQueryInput;