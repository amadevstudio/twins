import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

type postTypes = {
  headers: string;
};


export type error = AxiosError;
export function post<T = never, R = AxiosResponse<T>, D = never>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> {
  return axios.post(url, data, config);
}
