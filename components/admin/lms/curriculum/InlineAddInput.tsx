import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface InlineAddInputProps {
  onAdd: (value: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

const InlineAddInput: React.FC<InlineAddInputProps> = ({
  onAdd,
  placeholder = 'Enter text...',
  buttonText = 'Add item',
  className = '',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (value.trim()) {
        handleSave();
      } else {
        handleCancel();
      }
    }, 150);
  };

  if (isAdding) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-violet-500 outline-none px-1 py-1 text-sm"
        />
        <span className="text-xs text-zinc-400">Enter to save, Esc to cancel</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className={`flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ${className}`}
    >
      <Plus className="w-4 h-4" />
      {buttonText}
    </button>
  );
};

export default InlineAddInput;
