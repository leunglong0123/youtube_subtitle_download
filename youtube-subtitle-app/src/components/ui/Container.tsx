import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`w-full max-w-[1200px] mx-auto px-6 md:px-6 ${className}`}>
      {children}
    </div>
  );
};

export default Container; 