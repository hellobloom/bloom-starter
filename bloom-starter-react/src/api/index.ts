import * as http from "./http";

export const ping = () => http.get(`/ping`);
