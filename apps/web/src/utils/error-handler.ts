import { toast } from 'sonner'
import axios from 'axios'

// ── Error code → toast mapping ─────────────────────────────────────────────
// Centralizes all API error messages in one place. When the backend adds a new
// code, update this map instead of hunting through individual pages.

type ToastType = 'error' | 'info' | 'warning'

interface ErrorEntry {
  message: string
  type?: ToastType
}

const ERROR_MAP: Record<string, ErrorEntry> = {
  // Auth
  AUTH_INVALID_CREDENTIALS: { message: 'Invalid email or password.' },
  AUTH_EMAIL_TAKEN: {
    message: 'This email is already registered. Try logging in.',
  },
  AUTH_UNAUTHORIZED: { message: 'You are not authorized. Please sign in.' },

  // Company
  COMPANY_NOT_FOUND: { message: 'Company not found.' },
  COMPANY_REQUIRED: { message: 'You must belong to a company first.' },
  COMPANY_INVALID_MAGIC_LINK: {
    message: 'Invalid magic link. Please check and try again.',
  },
  COMPANY_ALREADY_ASSIGNED: {
    message: 'You are already assigned to a company.',
  },

  // Membership
  MEMBERSHIP_NOT_FOUND: { message: 'Membership not found.' },
  MEMBERSHIP_ALREADY_REVIEWED: {
    message: 'This membership has already been reviewed.',
  },
  MEMBERSHIP_PENDING: {
    message: 'You already have a pending request.',
    type: 'info',
  },

  // Report
  REPORT_NOT_FOUND: { message: 'Report not found.' },

  // Generic
  RESOURCE_ALREADY_EXISTS: { message: 'This resource already exists.' },
  RESOURCE_NOT_FOUND: { message: 'Resource not found.' },
  VALIDATION_ERROR: { message: 'Please check your input and try again.' },
}

// ── HTTP status → fallback messages ────────────────────────────────────────
const HTTP_STATUS_MESSAGES: Record<number, ErrorEntry> = {
  429: {
    message: 'Too many requests. Please wait a moment and try again.',
    type: 'warning',
  },
  403: { message: 'You do not have permission to perform this action.' },
  500: { message: 'Internal server error. Please try again later.' },
}

/**
 * Handles API errors by showing the appropriate toast notification.
 *
 * @returns The error `code` from the API response (if any), so callers can
 *          still perform side-effects for specific codes without duplicating
 *          the toast logic.
 *
 * @example
 * ```ts
 * onError: (error) => {
 *   const code = handleApiError(error, { fallback: 'Failed to join' })
 *   if (code === 'MEMBERSHIP_PENDING') setPendingRequest(true)
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  options?: {
    /** Override or extend the global error map for this call. */
    errorMap?: Record<string, ErrorEntry>
    /** Fallback message when no code match is found. */
    fallback?: string
  },
): string | undefined {
  if (!axios.isAxiosError(error)) {
    toast.error(options?.fallback ?? 'An unexpected error occurred.')
    return undefined
  }

  const code = error.response?.data?.code as string | undefined
  const serverMessage = error.response?.data?.message as string | undefined
  const status = error.response?.status

  // 1. Try code-specific match (custom overrides first, then global map)
  if (code) {
    const entry = options?.errorMap?.[code] ?? ERROR_MAP[code]
    if (entry) {
      showToast(entry)
      return code
    }
  }

  // 2. Try HTTP status fallback
  if (status && HTTP_STATUS_MESSAGES[status]) {
    showToast(HTTP_STATUS_MESSAGES[status])
    return code
  }

  // 3. Server message or generic fallback
  toast.error(
    serverMessage ?? options?.fallback ?? 'An unexpected error occurred.',
  )
  return code
}

/**
 * Extracts the API error code from an Axios error without showing any toast.
 * Useful when you only need the code for control flow.
 */
export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.code as string | undefined
  }
  return undefined
}

// ── Internal helper ────────────────────────────────────────────────────────

function showToast(entry: ErrorEntry) {
  const fn =
    entry.type === 'info'
      ? toast.info
      : entry.type === 'warning'
        ? toast.warning
        : toast.error
  fn(entry.message)
}
