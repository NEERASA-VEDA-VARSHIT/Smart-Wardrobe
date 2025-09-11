import { toast } from 'react-toastify';

// Simple error handling utility
export const showError = (message, error = null) => {
  console.error(message, error);
  toast.error(message, { position: 'bottom-right', autoClose: 4000 });
};

export const showSuccess = (message) => {
  toast.success(message, { position: 'bottom-right', autoClose: 2500 });
};

// API error handler
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error?.message || defaultMessage;
  showError(message);
  return message;
};
