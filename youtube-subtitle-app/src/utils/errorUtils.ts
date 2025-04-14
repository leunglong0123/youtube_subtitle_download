/**
 * Error types for categorizing different error scenarios
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Application error interface
 */
export interface AppError {
  message: string;
  type: ErrorType;
  statusCode?: number;
  retry?: boolean;
  details?: any;
}

/**
 * Create standardized application error object
 */
export function createError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  statusCode?: number,
  retry = false,
  details?: any
): AppError {
  return {
    message,
    type,
    statusCode,
    retry,
    details
  };
}

/**
 * Parse API error responses into standardized format
 */
export function parseApiError(error: any): AppError {
  // Network errors
  if (!navigator.onLine || error?.message?.includes('network')) {
    return createError(
      'Network connection issue. Please check your internet connection and try again.',
      ErrorType.NETWORK,
      undefined,
      true
    );
  }

  // Handle Axios errors
  if (error?.isAxiosError) {
    const statusCode = error.response?.status;
    const data = error.response?.data;

    // Not found
    if (statusCode === 404) {
      return createError(
        data?.error || 'The requested resource was not found.',
        ErrorType.NOT_FOUND,
        statusCode
      );
    }

    // Rate limiting
    if (statusCode === 429) {
      return createError(
        'Rate limit exceeded. Please try again in a few minutes.',
        ErrorType.RATE_LIMIT,
        statusCode,
        true
      );
    }

    // Authentication errors
    if (statusCode === 401 || statusCode === 403) {
      return createError(
        'Authentication error. Please check your API credentials.',
        ErrorType.AUTHENTICATION,
        statusCode
      );
    }

    // Server errors (potentially retryable)
    if (statusCode >= 500) {
      return createError(
        'Server error. Please try again later.',
        ErrorType.API,
        statusCode,
        true
      );
    }

    // Other API errors
    return createError(
      data?.error || 'An API error occurred.',
      ErrorType.API,
      statusCode
    );
  }

  // Default case for unknown errors
  return createError(
    error?.message || 'An unexpected error occurred.',
    ErrorType.UNKNOWN
  );
}

/**
 * Get user-friendly message for error
 */
export function getUserFriendlyErrorMessage(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection and try again.';
    case ErrorType.API:
      return 'We\'re having trouble communicating with our services. Please try again later.';
    case ErrorType.VALIDATION:
      return 'Please check the information you provided and try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource could not be found. It may have been moved or deleted.';
    case ErrorType.RATE_LIMIT:
      return 'You\'ve made too many requests. Please wait a moment and try again.';
    case ErrorType.AUTHENTICATION:
      return 'There was an authentication issue. Please try refreshing the page.';
    case ErrorType.UNKNOWN:
    default:
      return 'Something went wrong. Please try again or contact support if the issue persists.';
  }
}

/**
 * Parse YouTube-specific error messages
 */
export function parseYouTubeError(message: string): AppError {
  // Video not found or private
  if (message.includes('Video not found') || message.includes('private')) {
    return createError(
      'The YouTube video could not be found or is private.',
      ErrorType.NOT_FOUND,
      404
    );
  }

  // No subtitles
  if (message.includes('No subtitles') || message.includes('captions')) {
    return createError(
      'No subtitles are available for this video.',
      ErrorType.NOT_FOUND,
      404
    );
  }

  // YouTube API quota
  if (message.includes('quota') || message.includes('rate limit')) {
    return createError(
      'YouTube API quota exceeded. Please try again later.',
      ErrorType.RATE_LIMIT,
      429,
      true
    );
  }

  return createError(message, ErrorType.API);
} 