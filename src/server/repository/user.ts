import { db } from "@/server/db";
import { queryUserType, searchUserPageSize } from "@/server/api/types/user";
import {
  KeyWord,
  Prisma,
  RegistrationTarget,
  User,
  UserToKeyWord,
  UserToRegistrationTarget,
} from "@prisma/client";
import SortOrder = Prisma.SortOrder;

const userBaseInfoQuery = {
  include: {
    userInfo: true,
  },
};

const userFullInfoQuery = {
  include: {
    ...userBaseInfoQuery.include,
    userToKeyWords: {
      include: {
        keyWord: true,
      },
      orderBy: {
        order: SortOrder.asc,
      },
    },
    userToRegistrationTargets: {
      include: {
        registrationTarget: true,
      },
    },
  },
};

export async function findById(userId: string) {
  const query = { where: { id: userId } };
  return db.user.findFirst(query);
}

// export type UserWithConnections = Prisma.UserGetPayload<{
//   include: {
//     userInfo: true;
//     userToKeyWords: true;
//     userToRegistrationTargets: true;
//   };
// }>;
export async function findByIdWithInfo(userId: string) {
  const query = {
    ...{ where: { id: userId } },
    ...userFullInfoQuery,
  };
  return db.user.findFirst(query);
}

export async function findByKeyWords(
  userId: string | undefined,
  keyWords: string[],
  pageParam?: number,
) {
  const pageSize = searchUserPageSize;
  const page = pageParam ?? 1;
  const skip = (page - 1) * pageSize ?? 0;

  const excludedUsersQuery = (userId ? [userId] : []).concat(
    (
      await db.userToKeyWord.groupBy({
        by: ["userId"],
        having: {
          userId: {
            _count: {
              equals: keyWords.length,
            },
          },
        },
      })
    ).map((u) => u.userId),
  );

  const query = {
    where: {
      id: {
        in: excludedUsersQuery,
      },

      NOT: {
        id: userId
      },

      userToKeyWords: {
        every: {
          keyWordId: {
            in: keyWords,
          },
        },
      },
    },
  };

  const [results, count] = await db.$transaction([
    db.user.findMany({
      ...query,
      ...userBaseInfoQuery,
      skip: skip,
      take: pageSize,
    }),
    db.user.count(query),
  ]);

  return {
    results: results,
    pagination: {
      total: count,
    },
  };
}

// Dangerous

export async function updateUserInfo(userId: string, info: queryUserType) {
  return db.user.update({
    ...{
      data: {
        name: info.name,
        userInfo: {
          update: {
            data: {
              sex: info.sex,
              city: info.city,
              birthday: info.birthday,
              contacts: info.contacts,
              additionalInfo: info.additionalInfo,
            },
          },
        },
      },
      where: { id: userId },
    },
    ...userFullInfoQuery,
  });
}

export async function updateRegistrationTargetConnections(
  user: User,
  registrationTargetsToCreateConnection: RegistrationTarget[],
  registrationTargetConnectionsToDelete: UserToRegistrationTarget[],
) {
  return db.$transaction([
    db.userToRegistrationTarget.deleteMany({
      where: {
        OR: registrationTargetConnectionsToDelete.map((rtctd) => {
          return {
            userId: user.id,
            registrationTargetId: rtctd.registrationTargetId,
          };
        }),
      },
    }),

    db.userToRegistrationTarget.createMany({
      data: registrationTargetsToCreateConnection.map((rttcc) => {
        return { userId: user.id, registrationTargetId: rttcc.target };
      }),
    }),
  ]);
}

export async function deleteKeyWordsConnection(
  user: User,
  keyWordsConnections: UserToKeyWord[],
) {
  return db.userToKeyWord.deleteMany({
    where: {
      OR: keyWordsConnections.map((kwc) => {
        return {
          userId: user.id,
          keyWordId: kwc.keyWordId,
        };
      }),
    },
  });
}

export async function updateKeyWordsConnections(
  user: User,
  keyWordsInfo: { keyWord: KeyWord; order: number }[],
) {
  return db.$transaction(
    keyWordsInfo.map((kwi) =>
      db.userToKeyWord.upsert({
        update: {
          order: kwi.order,
        },
        create: {
          userId: user.id,
          keyWordId: kwi.keyWord.keyWord,
          order: kwi.order,
        },
        where: {
          userId_keyWordId: {
            userId: user.id,
            keyWordId: kwi.keyWord.keyWord,
          },
        },
      }),
    ),
  );
}
