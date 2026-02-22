import { DrizzleQueryError } from 'drizzle-orm'

export function isDrizzleQueryError(error: unknown): error is DrizzleQueryError {
  return error instanceof DrizzleQueryError
}

export function isDuplicateError(error: unknown) {
  if (!isDrizzleQueryError(error)) {
    return false
  }

  return error.cause?.message?.includes('duplicate key value violates unique constraint')
}

export function isReferenceError(error: unknown) {
  if (!isDrizzleQueryError(error)) {
    return false
  }

  return error.cause?.message?.includes('violates foreign key constraint')
}

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}
