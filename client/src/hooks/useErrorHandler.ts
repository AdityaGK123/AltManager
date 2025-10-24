import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface ErrorOptions {
  showToast?: boolean;
  toastTitle?: string;
  retryAction?: () => void;
  logError?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | string | unknown,
    options: ErrorOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = "Something went wrong",
      retryAction,
      logError = true
    } = options;

    // Log error for debugging
    if (logError) {
      console.error('Error handled by useErrorHandler:', error);
    }

    // Extract error message
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }

    // Show user-friendly error toast
    if (showToast) {
      toast({
        title: toastTitle,
        description: getUserFriendlyMessage(errorMessage),
        variant: "destructive",
        // Note: For retry functionality, toast action would need to be passed as element from component
      });
    }

    return errorMessage;
  }, [toast]);

  // Handle API errors specifically
  const handleApiError = useCallback((
    error: Error | Response | unknown,
    options: Omit<ErrorOptions, 'toastTitle'> = {}
  ) => {
    let errorMessage = "Network error occurred";
    let statusCode: number | undefined;

    if (error instanceof Response) {
      statusCode = error.status;
      errorMessage = `${error.status}: ${error.statusText}`;
    } else if (error instanceof Error) {
      // Check if it's an API error with status code in message
      const statusMatch = error.message.match(/^(\d{3}):/);
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1]);
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }

    const title = getApiErrorTitle(statusCode);
    return handleError(error, { ...options, toastTitle: title });
  }, [handleError]);

  return {
    handleError,
    handleApiError
  };
}

function getUserFriendlyMessage(errorMessage: string): string {
  // Map common error messages to user-friendly ones
  const errorMap: Record<string, string> = {
    'Network Error': 'Please check your internet connection and try again.',
    'Failed to fetch': 'Unable to connect. Please check your connection.',
    '401: Unauthorized': 'Please sign in to continue.',
    '403: Forbidden': 'You don\'t have permission to perform this action.',
    '404: Not Found': 'The requested resource was not found.',
    '429: Too Many Requests': 'Too many requests. Please wait a moment and try again.',
    '500: Internal Server Error': 'Server error occurred. Please try again later.',
    'Rate limit exceeded': 'You\'ve made too many requests. Please wait before trying again.',
    'Validation failed': 'Please check your input and try again.',
    'Invalid input data': 'Please verify your information and try again.'
  };

  // Check for exact matches first
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return original message if no mapping found
  return errorMessage;
}

function getApiErrorTitle(statusCode?: number): string {
  if (!statusCode) return "Connection Error";
  
  if (statusCode >= 400 && statusCode < 500) {
    return "Request Error";
  } else if (statusCode >= 500) {
    return "Server Error";
  } else {
    return "Network Error";
  }
}