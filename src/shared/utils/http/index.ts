/**
 * Error Handling Utilities
 * 
 * This file contains utility functions for standardized error handling
 * across controllers.
 */

import { ApiResponse } from '@/types/controllers';

import { CodeConstant } from '@/constant';

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string, 
  code: CodeConstant.ErrorCode = CodeConstant.ErrorCode.UNKNOWN_ERROR
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      code
    }
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Handle controller errors in a standardized way
 */
export function handleControllerError(error: any): ApiResponse {
  console.error('Controller error:', error);
  
  // If it's already an ApiResponse, return it
  if (error && typeof error === 'object' && 'success' in error) {
    return error as ApiResponse;
  }
  
  // Handle different error types
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return createErrorResponse(error);
  }
  
  // Default error response
  return createErrorResponse('An unknown error occurred');
}

/**
 * Try-catch wrapper for controller functions
 */
export function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<ApiResponse<T>> {
  return async (...args: any[]): Promise<ApiResponse<T>> => {
    try {
      const result = await fn(...args);
      return createSuccessResponse(result);
    } catch (error) {
      return handleControllerError(error);
    }
  };
} 

export function responseErrorNoSessionHeader() {
  return createErrorResponse(
    "No Session Header",
    CodeConstant.ErrorCode.UNAUTHORIZED // TODO: ERROR-CODE: Correct the Code
  )
}

export function responseErrorNoSessionFound() {
  return createErrorResponse(
    "No Session Found",
    CodeConstant.ErrorCode.UNAUTHORIZED // TODO: ERROR-CODE: Correct the Code
  )
}

export function responseErrorSessionExpired() {
  return createErrorResponse(
    "Session Expired",
    CodeConstant.ErrorCode.UNAUTHORIZED // TODO: ERROR-CODE: Correct the Code
  )
}
