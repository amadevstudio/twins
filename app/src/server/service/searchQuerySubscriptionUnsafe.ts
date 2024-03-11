import { NextApiResponse } from "next";
import * as userRepo from "@/server/repository/user";
import { AdapterUser } from "next-auth/adapters";
import { prismaAdapter } from "@/server/auth";
import { afterCreate } from "@/server/service/user";
import { setCookie } from "@/utils/cookies";
import { subscribe } from "@/server/service/searchQuerySubscription";

export async function subscribeAnon(
  res: NextApiResponse,
  email: string,
  searchQuery: string,
) {
  const verifiedUser = await userRepo.findByEmail(email, { verified: true });
  if (verifiedUser !== null) {
    throw new Error("User is verified");
  }

  const userByEmail = await userRepo.findByEmail(email, { verified: false });

  async function anonUser() {
    if (userByEmail) {
      return userByEmail;
    }

    // const user = await userRepo.createIncompleteByEmail(email);
    // await afterCreate(user);
    const user: AdapterUser = await prismaAdapter.createUser!({
      email: email,
      emailVerified: null,
    });

    return userRepo.findById(user.id);
  }

  const user = await anonUser();
  if (user === null) {
    throw new Error("Can't create user");
  }
  await afterCreate(user);

  setCookie(res, "anonUserId", user.id);

  return await subscribe(user.id, searchQuery);
}
