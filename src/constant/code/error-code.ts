/**
 * Error codes for the API
 */
export enum ErrorCode {
    // General errors
    UNKNOWN_ERROR = 1000,
    VALIDATION_ERROR = 1001,
    NOT_FOUND = 1002,
    UNAUTHORIZED = 1003,
    FORBIDDEN = 1004,
    
    // Database errors
    DATABASE_ERROR = 2000,
    QUERY_ERROR = 2001,
    
    // Content errors
    CONTENT_NOT_FOUND = 3000,
    INVALID_CONTENT_TYPE = 3001,
    
    // User errors
    USER_NOT_FOUND = 4000,
    INVALID_CREDENTIALS = 4001,
    USERNAME_TAKEN = 4002,
    
    // Social errors
    ALREADY_FOLLOWING = 5000,
    NOT_FOLLOWING = 5001,
    
    // Notification errors
    NOTIFICATION_NOT_FOUND = 6000
}
