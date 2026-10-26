import axios from "axios";

/**
 * Extracts a human-readable error message from an unknown caught value.
 * Handles AxiosError responses, standard Error objects, and plain strings.
 *
 * @param err      - The caught value (type `unknown`).
 * @param fallback - Message to return when no specific message is found.
 */
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred."): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message ?? err.message ?? fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  if (typeof err === "string" && err.length > 0) {
    return err;
  }

  return fallback;
}
