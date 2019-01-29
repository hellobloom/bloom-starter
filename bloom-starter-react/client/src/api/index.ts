import * as http from "./http";

type BaseResponse = {
  success: boolean;
  message: string;
};

export const session = (): Promise<BaseResponse & { token: string }> =>
  http.post(`/session`);
