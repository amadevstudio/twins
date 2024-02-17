import { db } from "@/server/db";
import { queryUserType } from "@/server/api/types/user";
import {
  KeyWord,
  Prisma,
  RegistrationTarget,
  User,
  UserToKeyWord,
  UserToRegistrationTarget,
} from "@prisma/client";
import SortOrder = Prisma.SortOrder;

const userFullInfoQuery = {
  include: {
    userInfo: true,
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
