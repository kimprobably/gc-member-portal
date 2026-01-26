import React, { useState, useRef, useEffect } from 'react';

interface InlineInputProps {
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  isEditing?: boolean;
  onEditStart?: () => void;
  autoFocus?: boolean;
}

const InlineInput: React.FC<InlineInputProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
  className = '',
  inputClassName = '',
  isEditing: controlledIsEditing,
  onEditStart,
  autoFocus = false,
}) => {
  const [internalIsEditing, setInternalIsEditing] = useState(autoFocus);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = controlledIsEditing ?? internalIsEditing;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClick = () => {
    if (!isEditing) {
      setInternalIsEditing(true);
      onEditStart?.();
    }
  };

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
    setInternalIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setInternalIsEditing(false);
    onCancel?.();
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
      if (inputValue.trim()) {
        handleSave();
      } else {
        handleCancel();
      }
    }, 150);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`bg-transparent border-b border-violet-500 outline-none px-1 ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded ${className}`}
    >
      {value || <span className="text-zinc-400">{placeholder}</span>}
    </span>
  );
};

export default InlineInput;
