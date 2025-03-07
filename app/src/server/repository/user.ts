import { db } from "@/server/db";
import { type queryUserType, searchUserPageSize } from "@/server/api/types/user";
import {
  type FilesProvider,
  type KeyWord,
  Prisma,
  type RegistrationTarget,
  type User,
  type UserToKeyWord,
  type UserToRegistrationTarget,
} from "@prisma/client";
import SortOrder = Prisma.SortOrder;

const userImagesQuery = {
  include: {
    userImages: true,
  },
};

const userAvatarQuery = {
  include: {
    userImages: {
      where: {
        isAvatar: true,
      },
      orderBy: {
        createdAt: SortOrder.desc,
      },
      take: 1,
    },
  },
};

const userBaseInfoQuery = {
  include: {
    userInfo: true,
    ...userAvatarQuery.include
  },
};

const userWithRegistrationTargetsQuery = {
  include: {
    userToRegistrationTargets: {
      include: {
        registrationTarget: true,
      },
    },
  },
};

const userToKeyWordsQuery = {
  include: {
    userToKeyWords: {
      include: {
        keyWord: true,
      },
      orderBy: {
        order: SortOrder.asc,
      },
    },
  },
};

const userFullInfoQuery = {
  include: {
    ...userBaseInfoQuery.include,
    ...userWithRegistrationTargetsQuery.include,
    ...userToKeyWordsQuery.include,
    ...userImagesQuery.include,
  },
};

export async function findByEmail(
  email: string,
  params: { verified?: boolean } = {},
) {
  const query = {
    where: {
      email: email,
      // Have email verified or some Account
      ...(params.verified === true && {
        OR: [{ emailVerified: { not: null } }, { accounts: { some: {} } }],
      }),
      ...(params.verified === false && {
        emailVerified: null,
        accounts: { none: {} },
      }),
    },
  };
  return db.user.findFirst(query);
}

// type infoLevel = "base" | "registrationTargets" | "keyWords" | "images";

export async function findById(
  userId: string,
  // takingInfo: { [K in infoLevel]?: boolean } = {
  //   base: true,
  //   registrationTargets: true,
  // },
) {
  // takingInfo = {
  //   base: true,
  //   registrationTargets: true,
  //   ...takingInfo,
  // };

  // Dynamic include concept to overwrite existing functions
  // const include = {
  //   ...(takingInfo?.base === true && userBaseInfoQuery.include),
  //   ...(takingInfo?.registrationTargets === true &&
  //     userWithRegistrationTargetsQuery.include),
  //   ...(takingInfo.keyWords === true && userToKeyWordsQuery.include),
  //   ...(takingInfo?.images === true && userImagesQuery.include),
  // };

  const query = {
    where: { id: userId },
    include: {
      ...userBaseInfoQuery.include,
      ...userWithRegistrationTargetsQuery.include,
      ...userImagesQuery.include,
    },
  };
  return db.user.findFirst(query);
}

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
  if (keyWords.length == 0) {
    return new Promise(function (
      resolve: (value: { results: []; pagination: { total: number } }) => void,
      _,
    ) {
      resolve({
        results: [],
        pagination: {
          total: 0,
        },
      });
    });
  }

  const pageSize = searchUserPageSize;
  const page = pageParam ?? 1;
  const skip = (page - 1) * pageSize ?? 0;

  const queryParams: string[] = [];
  const rawQueryKeyWords: string[] = [];
  keyWords.forEach((kw, i) => {
    queryParams.push(kw);
    rawQueryKeyWords.push(`utkw."keyWordId" = $${i + 1}`);
  });

  const sqlQuery = `
      SELECT u.id FROM "User" AS u
      INNER JOIN "UserToKeyWord" AS utkw ON (
        utkw."userId" = u."id"
        AND (${rawQueryKeyWords.join(" OR ")}))
      GROUP BY u."id"
      HAVING COUNT(*) = ${keyWords.length}
    `;

  const selectedUserIds: { id: string }[] = await db.$queryRawUnsafe(
    sqlQuery,
    ...queryParams,
  );

  const query = {
    where: {
      id: { in: selectedUserIds.map((id) => id.id) },
      NOT: {
        id: userId,
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

export async function updateImage(
  userId: string,
  imageProvider: FilesProvider,
  imageId: string,
  isAvatar: boolean,
) {
  return db.userImage.upsert({
    where: {
      userId: userId,
      isAvatar: isAvatar,
    },
    update: {
      imageProvider: imageProvider,
      imageId: imageId,
      updatedAt: new Date()
    },
    create: {
      userId: userId,
      isAvatar: isAvatar,
      imageProvider: imageProvider,
      imageId: imageId,
      updatedAt: new Date()
    },
  });
}
