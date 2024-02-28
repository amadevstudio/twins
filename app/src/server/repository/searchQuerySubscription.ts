import { KeyWord, KeyWordsSubscription } from "@prisma/client";
import { db } from "@/server/db";

export async function findByKeyWords(userId: string, keyWords: KeyWord[]) {
  if (keyWords.length === 0) {
    return null;
  }

  const queryParams: string[] = [];
  const rawQueryKeyWords: string[] = [];
  keyWords.forEach((kw, i) => {
    queryParams.push(kw.keyWord);
    rawQueryKeyWords.push(`$${i + 1}`);
  });

  const keyWordSubscriptions: KeyWordsSubscription[] = await db.$queryRawUnsafe(`
    SELECT kws.*
    FROM "KeyWordsSubscription" AS kws
    INNER JOIN "KeyWordsSubscriptionToKeyWord" AS kwstkw ON kwstkw."keyWordSubscriptionId" = kws."id"
    WHERE kws."userId" = '${userId}' AND kwstkw."keyWordId" IN (${rawQueryKeyWords.join(', ')})
    GROUP BY kws."id"
    HAVING
        COUNT(kwstkw."keyWordId") = (
            SELECT COUNT(*) FROM "KeyWordsSubscriptionToKeyWord" AS x WHERE x."keyWordSubscriptionId" = kws."id"
        )
        AND COUNT(kwstkw."keyWordId") = ${keyWords.length}
  `, ...queryParams);

  if (keyWordSubscriptions.length == 0) {
    return null;
  }

  return keyWordSubscriptions[0] ?? null;
}

export function create(userId: string, keyWords: KeyWord[]) {
  return db.keyWordsSubscription.create({
    data: {
      userId: userId,
      keyWordsSubscriptionToKeyWords: {
        create: keyWords.map((keyWord) => {
          return { keyWordId: keyWord.keyWord };
        }),
      },
    },
  });
}
