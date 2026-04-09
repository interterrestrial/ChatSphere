import React from 'react';

interface TypingIndicatorProps {
  names?: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ names = [] }) => {
  const label = names.length === 0
    ? 'Someone is typing'
    : names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : 'Several people are typing';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1.5rem',
        animation: 'fadeIn 0.2s ease forwards',
      }}
    >
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
        {label}…
      </span>
    </div>
  );
};

export default TypingIndicator;
