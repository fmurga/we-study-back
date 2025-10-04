export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  errors?: string[];
}

export class ResponseBuilder {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static successWithPagination<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      message,
      meta: {
        total,
        page,
        limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  static error(message: string, errors?: string[]): ApiResponse {
    return {
      success: false,
      message,
      errors,
    };
  }

  static created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static updated<T>(data: T, message = 'Resource updated successfully'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static deleted(message = 'Resource deleted successfully'): ApiResponse {
    return {
      success: true,
      message,
    };
  }
}
