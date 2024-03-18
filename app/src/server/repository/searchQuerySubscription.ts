import {
  type KeyWord,
  type KeyWordsSubscription,
  type KeyWordsSubscriptionStatuses,
} from "@prisma/client";
import { db } from "@/server/db";

export async function findById(id: string) {
  return db.keyWordsSubscription.findFirst({
    where: { id },
    include: {
      keyWordsSubscriptionToKeyWords: {
        include: {
          keyWord: true,
        },
      },
    },
  });
}

export async function setStatus(
  id: string,
  status: KeyWordsSubscriptionStatuses,
) {
  return db.keyWordsSubscription.update({
    where: { id },
    data: {
      status,
    },
  });
}

export async function findByKeyWords(
  userId: string,
  keyWords: KeyWord[],
  status: KeyWordsSubscriptionStatuses | undefined = undefined,
) {
  if (keyWords.length === 0) {
    return null;
  }

  const queryParams: string[] = [];
  const rawQueryKeyWords: string[] = [];
  keyWords.forEach((kw, i) => {
    queryParams.push(kw.keyWord);
    rawQueryKeyWords.push(`$${i + 1}`);
  });

  const keyWordSubscriptions: KeyWordsSubscription[] = await db.$queryRawUnsafe(
    `
    SELECT kws.*
    FROM "KeyWordsSubscription" AS kws
    INNER JOIN "KeyWordsSubscriptionToKeyWord" AS kwstkw ON kwstkw."keyWordSubscriptionId" = kws."id"
    WHERE kws."userId" = '${userId}' AND kwstkw."keyWordId" IN (${rawQueryKeyWords.join(", ")})
    GROUP BY kws."id"
    HAVING
        COUNT(kwstkw."keyWordId") = (
            SELECT COUNT(*) FROM "KeyWordsSubscriptionToKeyWord" AS x WHERE x."keyWordSubscriptionId" = kws."id"
        )
        AND COUNT(kwstkw."keyWordId") = ${keyWords.length}
        ${status === undefined ? "" : `AND STATUS = '${status}'`}
  `,
    ...queryParams,
  );

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

export async function findUserIntersection(
  batch_size = 10000,
): Promise<{ id: string; searcher_id: string; candidate_id: string }[]> {
  return db.$queryRawUnsafe(`
    SELECT KWS."id", KWS."userId" AS searcher_id, UTKW."userId" AS candidate_id --,
       -- string_agg(KWSTKW."keyWordId", ', ') AS searched_by,
       -- string_agg(UTKW."keyWordId", ', ') AS candidate_have
    FROM "KeyWordsSubscription" AS KWS
    INNER JOIN public."KeyWordsSubscriptionToKeyWord" KWSTKW on KWS.id = KWSTKW."keyWordSubscriptionId"
    INNER JOIN public."UserToKeyWord" UTKW on KWSTKW."keyWordId" = UTKW."keyWordId"
    WHERE
        KWS.status = 'NEW'
        AND UTKW."userId" != KWS."userId"
    GROUP BY KWS."id", UTKW."userId"
    HAVING count(*) = (
        SELECT count(*)
        FROM "KeyWordsSubscriptionToKeyWord"
        KWSTKW2
        WHERE KWSTKW2."keyWordSubscriptionId" = KWS."id"
    )
    LIMIT ${batch_size};
  `);
}
