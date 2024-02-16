import {db} from "@/server/db";
import {queryUserType} from "@/server/api/types/user";

const userFullInfoQuery = {
  include: {
    userInfo: true,
    userToKeyWords: {
      include: {
        keyWord: true,
      },
    },
    userToRegistrationTargets: {
      include: {
        registrationTarget: true,
      },
    },
  },
}

export async function findById(userId: string) {
  const query = {where: {id: userId}}
  return db.user.findFirst(query);
}

export async function findByIdWithInfo(userId: string) {
  const query = {
    ...{where: {id: userId}},
    ...userFullInfoQuery
  }
  return db.user.findFirst(query)
}

export async function updateUserInfo(userId: string, info: queryUserType) {
  return db.user.update({
    data: {
      name: info.name,
      userInfo: {
        update: {
          data: {
            sex: info.sex,
          },
        },
      },
    },
    where: { id: userId },
  });
}
