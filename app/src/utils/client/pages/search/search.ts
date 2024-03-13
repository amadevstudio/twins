import {z} from "zod";
import {searchUserSchema} from "@/server/api/types/user";

export const pageParamName = "p"
export const searchParamName = "q"

export function getBaseUrl(query: string) {
  return `/search?
${searchParamName}=${query}`
}

export function constructSearchUrl(data: z.infer<typeof searchUserSchema>) {
  return `${getBaseUrl(data.query)}
${!!data.page ? `&page=${data.page}` : ""}`
}
