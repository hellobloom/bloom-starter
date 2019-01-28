import * as http from "./http";

type BaseResponse = {
  result: string;
  message: string;
};

export const session = (): Promise<BaseResponse & { token: string }> =>
  http.post(`/session`);
