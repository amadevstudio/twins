import {processKeyWordsString} from "@/server/service/keyWord";
import {env} from "@/env";
import * as searchQuerySubscriptionRepo from "@/server/repository/searchQuerySubscription";
import * as keyWordRepo from "@/server/repository/keyWord";

export async function findByQuery(userId: string, searchQuery: string) {
  const keyWords = processKeyWordsString(searchQuery)
  const newKeyWordsCreated = await keyWordRepo.findOrCreateByIds(keyWords)
  return searchQuerySubscriptionRepo.findByKeyWords(userId, newKeyWordsCreated);
}

export async function subscribe(userId: string, searchQuery: string) {
  const keyWords = processKeyWordsString(searchQuery)
  const newKeyWordsCreated = await keyWordRepo.findOrCreateByIds(keyWords)
  const subscription = await searchQuerySubscriptionRepo.findByKeyWords(userId, newKeyWordsCreated);
  if (subscription !== null) {
    return subscription;
  }

  return searchQuerySubscriptionRepo.create(userId, newKeyWordsCreated);
}
