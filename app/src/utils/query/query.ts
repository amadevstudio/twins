import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

export type error = AxiosError;
export function post<T = never, R = AxiosResponse<T>, D = never>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> {
  return axios.post(url, data, config);
}
