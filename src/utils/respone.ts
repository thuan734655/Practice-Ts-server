import { Response } from 'express';
import { IApiResponse } from 'types/Respone.js';

export const sendResponse = <T>(res: Response, status: number, response: IApiResponse<T>) => {
  res.status(status).json(response);
};
