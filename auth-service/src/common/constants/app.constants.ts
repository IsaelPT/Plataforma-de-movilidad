// Security constants
export const BCRYPT_ROUNDS = 12;
export const JWT_TOKEN_HASH_ROUNDS = 10;

// Validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Session constants
export const SESSION_EXPIRATION_MINUTES = 15;

// API constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;