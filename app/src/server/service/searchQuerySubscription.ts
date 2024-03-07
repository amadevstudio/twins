import { processKeyWordsString } from "@/server/service/keyWord";
import * as searchQuerySubscriptionRepo from "@/server/repository/searchQuerySubscription";
import * as keyWordRepo from "@/server/repository/keyWord";
import * as userRepo from "@/server/repository/user";
import { afterCreate } from "@/server/service/user";
import { NextApiRequest, NextApiResponse } from "next";
import { setCookie } from "@/utils/cookies";
import { KeyWordsSubscriptionStatuses } from "@prisma/client";
import { prismaAdapter } from "@/server/auth";
import {Adapter, AdapterUser} from "next-auth/adapters";

export async function findByQuery(userId: string, searchQuery: string) {
  const keyWords = processKeyWordsString(searchQuery);
  const newKeyWordsCreated = await keyWordRepo.findOrCreateByIds(keyWords);
  return searchQuerySubscriptionRepo.findByKeyWords(
    userId,
    newKeyWordsCreated,
    "NEW",
  );
}

export async function findById(id: string) {
  return searchQuerySubscriptionRepo.findById(id);
}

export async function setStatus(
  id: string,
  status: KeyWordsSubscriptionStatuses,
) {
  return searchQuerySubscriptionRepo.setStatus(id, status);
}

export async function subscribe(userId: string, searchQuery: string) {
  const keyWords = processKeyWordsString(searchQuery);
  const newKeyWordsCreated = await keyWordRepo.findOrCreateByIds(keyWords);

  const users = await userRepo.findByKeyWords(userId, keyWords, 1);
  if (users.pagination.total != 0) {
    throw new Error("Users exists");
  }

  const subscription = await searchQuerySubscriptionRepo.findByKeyWords(
    userId,
    newKeyWordsCreated,
    "NEW",
  );
  if (subscription !== null) {
    return subscription;
  }

  return searchQuerySubscriptionRepo.create(userId, newKeyWordsCreated);
}

export async function findByQueryAnon(
  req: NextApiRequest,
  searchQuery: string,
) {
  const userId = req.cookies.anonUserId;
  if (userId === undefined) {
    return null;
  }

  return findByQuery(userId, searchQuery);
}

export async function subscribeAnon(
  res: NextApiResponse,
  email: string,
  searchQuery: string,
) {
  const userByEmail = await userRepo.findByEmail(email);

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

  await subscribe(user.id, searchQuery);
}

export async function findUserIntersection(batch_size = 10000) {
  return searchQuerySubscriptionRepo.findUserIntersection(batch_size);
}
