import { toast } from 'sonner'
import axios from 'axios'

type ToastType = 'error' | 'info' | 'warning'

interface ErrorEntry {
  message: string
  type?: ToastType
}

const ERROR_MAP: Record<string, ErrorEntry> = {
  AUTH_INVALID_CREDENTIALS: { message: 'Invalid email or password.' },
  AUTH_EMAIL_TAKEN: {
    message: 'This email is already registered. Try logging in.',
  },
  AUTH_UNAUTHORIZED: { message: 'You are not authorized. Please sign in.' },

  COMPANY_NOT_FOUND: { message: 'Company not found.' },
  COMPANY_REQUIRED: { message: 'You must belong to a company first.' },
  COMPANY_INVALID_MAGIC_LINK: {
    message: 'Invalid magic link. Please check and try again.',
  },
  COMPANY_ALREADY_ASSIGNED: {
    message: 'You are already assigned to a company.',
  },

  MEMBERSHIP_NOT_FOUND: { message: 'Membership not found.' },
  MEMBERSHIP_ALREADY_REVIEWED: {
    message: 'This membership has already been reviewed.',
  },
  MEMBERSHIP_PENDING: {
    message: 'You already have a pending request.',
    type: 'info',
  },

  REPORT_NOT_FOUND: { message: 'Report not found.' },

  RESOURCE_ALREADY_EXISTS: { message: 'This resource already exists.' },
  RESOURCE_NOT_FOUND: { message: 'Resource not found.' },
  VALIDATION_ERROR: { message: 'Please check your input and try again.' },
}

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
 * @param error - The caught error, typically an Axios error.
 * @param options - Optional overrides for error messages and fallback text.
 * @returns The API error code from the response if present, or undefined.
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

  if (code) {
    const entry = options?.errorMap?.[code] ?? ERROR_MAP[code]
    if (entry) {
      showToast(entry)
      return code
    }
  }

  if (status && HTTP_STATUS_MESSAGES[status]) {
    showToast(HTTP_STATUS_MESSAGES[status])
    return code
  }

  toast.error(
    serverMessage ?? options?.fallback ?? 'An unexpected error occurred.',
  )
  return code
}

/**
 * Extracts the API error code from an Axios error without showing any toast.
 *
 * @param error - The caught error, typically an Axios error.
 * @returns The API error code if present, or undefined.
 */
export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.code as string | undefined
  }
  return undefined
}

function showToast(entry: ErrorEntry) {
  const fn =
    entry.type === 'info'
      ? toast.info
      : entry.type === 'warning'
        ? toast.warning
        : toast.error
  fn(entry.message)
}
