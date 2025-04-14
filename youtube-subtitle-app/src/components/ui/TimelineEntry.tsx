import React from 'react';

interface TimelineEntryProps {
  timestamp: string;
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const TimelineEntry: React.FC<TimelineEntryProps> = ({
  timestamp,
  text,
  isActive = false,
  onClick
}) => {
  return (
    <div 
      className={`
        px-4 
        py-3 
        bg-white 
        border-b 
        border-gray-200 
        cursor-pointer 
        transition-colors
        hover:bg-gray-100
        ${isActive ? 'bg-gray-100 font-medium' : ''}
      `}
      onClick={onClick}
    >
      <span className="font-mono text-sm text-gray-600 mr-3">{timestamp}</span>
      <span className="text-base">{text}</span>
    </div>
  );
};

export default TimelineEntry; 