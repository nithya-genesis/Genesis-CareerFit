/**
 * utils/errorFormatter.js
 * Centralized Error Formatter for Genesis CareerFit UI.
 * Guarantees that [object Object] is NEVER rendered anywhere in the interface.
 */

export function formatErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return '';
  
  // If already a clean string
  if (typeof error === 'string') {
    if (error === '[object Object]' || error.trim() === '') {
      return fallback;
    }
    return error;
  }

  // If Error instance
  if (error instanceof Error) {
    if (error.response?.data) {
      return formatErrorMessage(error.response.data, error.message || fallback);
    }
    if (error.message && error.message !== '[object Object]') {
      return error.message;
    }
  }

  // If object with 'detail' (FastAPI standard)
  if (error.detail) {
    if (typeof error.detail === 'string') {
      return error.detail;
    }
    if (Array.isArray(error.detail)) {
      // Pydantic validation errors: [{ loc: [...], msg: "...", type: "..." }]
      const msgs = error.detail.map(d => {
        if (typeof d === 'string') return d;
        const field = Array.isArray(d.loc) ? d.loc.filter(l => l !== 'body').join('.') : '';
        return field ? `${field}: ${d.msg}` : d.msg || 'Invalid field';
      }).filter(Boolean);
      return msgs.join(', ') || fallback;
    }
    if (typeof error.detail === 'object') {
      return error.detail.message || error.detail.error || JSON.stringify(error.detail);
    }
  }

  // If object with 'message' or 'error'
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }
  if (error.error && typeof error.error === 'string') {
    return error.error;
  }

  // If array of messages
  if (Array.isArray(error)) {
    const msgs = error.map(e => formatErrorMessage(e, '')).filter(Boolean);
    return msgs.join('; ') || fallback;
  }

  // Generic object with keys
  try {
    const keys = Object.keys(error);
    if (keys.length > 0) {
      const firstVal = error[keys[0]];
      if (typeof firstVal === 'string') return `${keys[0]}: ${firstVal}`;
    }
  } catch {
    // ignore
  }

  return fallback;
}

export default formatErrorMessage;
