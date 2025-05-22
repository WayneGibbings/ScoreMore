/**
 * Utility functions for clipboard operations
 */

/**
 * Try to copy text to clipboard using the modern Clipboard API
 * @param text - The text to copy
 * @returns Promise that resolves to true if successful, false if failed
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check for Android Chrome which has known clipboard issues
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);

    if (isAndroid && isChrome) {
      // Android Chrome has issues with clipboard API
      return false;
    }

    // Try using the modern Clipboard API with proper feature detection
    if (
      navigator &&
      typeof navigator.clipboard === 'object' &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // If modern API isn't available, try the execCommand fallback
    return fallbackCopyToClipboard(text);
  } catch (err) {
    console.error('Clipboard operation failed:', err);
    return false;
  }
}

/**
 * Legacy fallback for copying text to clipboard
 * @param text - The text to copy
 * @returns boolean indicating success or failure
 */
export function fallbackCopyToClipboard(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Make it invisible but part of the document
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);

    // For mobile focus and selection
    if (/webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      textarea.style.opacity = '1'; // Make it visible for mobile
      textarea.style.fontSize = '16px'; // Prevent zoom
      textarea.contentEditable = 'true';
      textarea.readOnly = false;
    }

    // Select the text
    textarea.focus();
    textarea.select();

    // For iOS devices
    const range = document.createRange();
    range.selectNodeContents(textarea);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      textarea.setSelectionRange(0, textarea.value.length); // For mobile devices
    }

    // Try the copy command
    const successful = document.execCommand('copy');

    // Clean up
    document.body.removeChild(textarea);

    return successful;
  } catch (err) {
    console.error('Fallback clipboard method failed:', err);
    return false;
  }
}

/**
 * Check if the device/browser is likely to have clipboard issues
 * Used to determine if we should show alternative UI
 */
export function hasClipboardSupport(): boolean {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isChrome = /Chrome/i.test(navigator.userAgent);

  if (isAndroid && isChrome) {
    return false;
  }

  return (
    (navigator &&
      typeof navigator.clipboard === 'object' &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext) ||
    document.queryCommandSupported('copy')
  );
}
