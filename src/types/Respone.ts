export interface IApiResponse<T> {
    data?: T;
    totalItems?: number;
    message?: string;
    success?: boolean;
  }
  