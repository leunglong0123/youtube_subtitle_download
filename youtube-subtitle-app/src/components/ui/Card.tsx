import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  hover = true
}) => {
  return (
    <div 
      className={`
        bg-white 
        text-black 
        rounded-xl 
        border 
        border-gray-200 
        p-6 
        shadow-sm 
        mb-6
        ${hover ? 'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card; 