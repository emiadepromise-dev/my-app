export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  return new AppError("An unexpected error occurred");
}
