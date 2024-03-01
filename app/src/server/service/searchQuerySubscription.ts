import { processKeyWordsString } from "@/server/service/keyWord";
import * as searchQuerySubscriptionRepo from "@/server/repository/searchQuerySubscription";
import * as keyWordRepo from "@/server/repository/keyWord";
import * as userRepo from "@/server/repository/user";

export async function findByQuery(userId: string, searchQuery: string) {
  const keyWords = processKeyWordsString(searchQuery);
  const newKeyWordsCreated = await keyWordRepo.findOrCreateByIds(keyWords);
  return searchQuerySubscriptionRepo.findByKeyWords(userId, newKeyWordsCreated);
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
  );
  if (subscription !== null) {
    return subscription;
  }

  return searchQuerySubscriptionRepo.create(userId, newKeyWordsCreated);
}

export async function findUserIntersection(batch_size = 10000) {
  return searchQuerySubscriptionRepo.findUserIntersection(batch_size);
}
