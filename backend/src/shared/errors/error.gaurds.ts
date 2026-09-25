export interface MongooseCastError extends Error {
  name: "CastError";
  path?: string;
}

export const isMongooseCastError = (err: unknown): err is MongooseCastError => {
  return err instanceof Error && err.name === "CastError";
};

export interface MongoDuplicateError {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

export const isMongoDuplicateError = (
  err: unknown,
): err is MongoDuplicateError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === 11000
  );
};

export interface JwtError extends Error {
  name: "JsonWebTokenError" | "TokenExpiredError";
}

export const isJwtError = (err: unknown): err is JwtError => {
  return (
    err instanceof Error &&
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
  );
};
