import { processKeyWordsString } from "@/server/service/keyWord";
import * as searchQuerySubscriptionRepo from "@/server/repository/searchQuerySubscription";
import * as keyWordRepo from "@/server/repository/keyWord";
import * as userRepo from "@/server/repository/user";
import { type NextApiRequest } from "next";
import { type KeyWordsSubscriptionStatuses } from "@prisma/client";
import {
  searchQueryCreatedSubscriptionMailerQueue,
  QUEUE_NAMES,
} from "@/jobs/queues/searchQuerySubscriptionMailerQueue";

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

  const newSubscription = await searchQuerySubscriptionRepo.create(
    userId,
    newKeyWordsCreated,
  );

  await searchQueryCreatedSubscriptionMailerQueue.add(
    `${QUEUE_NAMES.CREATED} for ${newSubscription.userId}, subscriptionId is ${newSubscription.id}`,
    newSubscription,
  );

  return newSubscription;
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
