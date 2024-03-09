import * as nextAuth from "next-auth/react";
import {
  type BuiltInProviderType,
  type RedirectableProviderType,
} from "next-auth/providers/index";
import {
  type GetSessionParams,
  type SignInAuthorizationParams,
  type SignInOptions,
  type SignInResponse,
} from "next-auth/react";
import {cookies} from "next/headers";
import {localRemoveItem} from "@/utils/localStorageMiddleware";

export async function signIn<
  P extends RedirectableProviderType | undefined = undefined,
>(
  provider?: nextAuth.LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams,
): Promise<
  P extends RedirectableProviderType ? SignInResponse | undefined : undefined
> {

  return nextAuth.signIn(provider, options, authorizationParams);
}

export async function signOut() {
  return nextAuth.signOut();
}

export function useSession() {
  return nextAuth.useSession();
}

export function getSession(params?: GetSessionParams) {
  return nextAuth.getSession(params);
}
