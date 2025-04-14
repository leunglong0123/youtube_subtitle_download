import React from 'react';
import { ErrorType, AppError } from '../utils/errorUtils';

interface ErrorDisplayProps {
  error: AppError | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * A reusable component for displaying error messages
 * with appropriate styling based on error type and
 * retry functionality when applicable
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry,
  className = ''
}) => {
  if (!error) return null;

  // Determine styling based on error type
  let bgColor = 'bg-gray-100';
  let borderColor = 'border-black';
  let textColor = 'text-black';
  
  if (error.type === ErrorType.NETWORK || error.type === ErrorType.RATE_LIMIT) {
    bgColor = 'bg-gray-100';
    borderColor = 'border-gray-600';
    textColor = 'text-gray-800';
  } 
  else if (error.type === ErrorType.NOT_FOUND) {
    bgColor = 'bg-gray-50';
    borderColor = 'border-gray-400';
    textColor = 'text-gray-700';
  }

  return (
    <div className={`${bgColor} ${borderColor} border-l-4 p-4 rounded ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Icon changes based on error type */}
          {error.type === ErrorType.NOT_FOUND ? (
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          ) : error.type === ErrorType.NETWORK ? (
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textColor}`}>
            {error.message}
          </h3>
          {error.details && (
            <div className="mt-2 text-sm">
              <p>{error.details}</p>
            </div>
          )}
          {error.retry && onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={`bg-gray-200 text-black hover:bg-gray-300 px-3 py-1.5 rounded-md text-sm font-medium`}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 