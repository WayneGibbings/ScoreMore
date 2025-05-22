/**
 * Utility functions for displaying toast notifications
 */

// Define the Toast interface that can be used throughout the app
export interface Toast {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'info';
}

/**
 * Create a toast notification handler
 * Used with useState in components
 *
 * @param setToast - The React state setter function for toast
 * @param duration - How long to show the toast (ms)
 * @returns An object with methods to show different types of toasts
 */
export function createToastHandler(setToast: (toast: Toast) => void, duration: number = 3000) {
  return {
    /**
     * Show a success toast notification
     * @param message - The message to display
     */
    showSuccess: (message: string) => {
      setToast({
        message,
        visible: true,
        type: 'success',
      });

      setTimeout(() => {
        setToast({ message: '', visible: false });
      }, duration);
    },

    /**
     * Show an error toast notification
     * @param message - The message to display
     */
    showError: (message: string) => {
      setToast({
        message,
        visible: true,
        type: 'error',
      });

      setTimeout(() => {
        setToast({ message: '', visible: false });
      }, duration);
    },

    /**
     * Show an info toast notification
     * @param message - The message to display
     */
    showInfo: (message: string) => {
      setToast({
        message,
        visible: true,
        type: 'info',
      });

      setTimeout(() => {
        setToast({ message: '', visible: false });
      }, duration);
    },

    /**
     * Hide the current toast notification
     */
    hideToast: () => {
      setToast({ message: '', visible: false });
    },
  };
}
