import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  children, 
  className = '',
  ...props 
}) => {
  // Base styles that apply to all buttons
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-in-out focus:outline-none";
  
  // Size specific styles
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-5 py-2.5 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  // Variant specific styles
  const variantStyles = {
    primary: "bg-black text-white border border-black hover:bg-gray-800 active:bg-gray-700 focus:ring-2 focus:ring-gray-300",
    secondary: "bg-gray-100 text-black border border-gray-200 hover:bg-gray-200 active:bg-gray-300 focus:ring-2 focus:ring-gray-300"
  };
  
  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";
  
  // Disabled styles
  const disabledStyles = props.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 