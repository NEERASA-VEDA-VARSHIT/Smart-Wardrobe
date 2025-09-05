// Simple error handling utility
export const showError = (message, error = null) => {
  console.error(message, error);
  // For now, we'll use a simple alert, but this could be replaced with a toast notification system
  alert(message);
};

export const showSuccess = (message) => {
  // For now, we'll use a simple alert, but this could be replaced with a toast notification system
  alert(message);
};

// API error handler
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error?.message || defaultMessage;
  showError(message);
  return message;
};
