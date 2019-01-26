import * as http from "./http";

type BaseResponse = {
  result: string;
  message: string;
};

export const login = (): Promise<BaseResponse> => http.post(`/login`);

export const test = (): Promise<BaseResponse> => http.get(`/test`);
