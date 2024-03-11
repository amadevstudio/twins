import { processKeyWordsString } from "@/server/service/keyWord";
import * as searchQuerySubscriptionRepo from "@/server/repository/searchQuerySubscription";
import * as keyWordRepo from "@/server/repository/keyWord";
import * as userRepo from "@/server/repository/user";
import { NextApiRequest } from "next";
import { KeyWordsSubscriptionStatuses } from "@prisma/client";

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

export async function findUserIntersection(batch_size = 10000) {
  return searchQuerySubscriptionRepo.findUserIntersection(batch_size);
}
