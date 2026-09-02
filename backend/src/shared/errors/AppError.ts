export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);

    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}