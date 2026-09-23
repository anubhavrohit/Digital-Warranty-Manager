import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-cream-dark/60 p-5 shadow-warm transition-all duration-200 ${
        hoverable ? 'hover:shadow-warm-hover hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
