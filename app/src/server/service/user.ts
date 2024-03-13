import * as userRepo from "@/server/repository/user";
import * as userInfoRepo from "@/server/repository/userInfo";
import { queryUserType, searchUserType } from "@/server/api/types/user";
import * as registrationTargetRepo from "@/server/repository/registrationTarget";
import * as keyWordRepo from "@/server/repository/keyWord";
import { processKeyWordsString } from "@/server/service/keyWord";
import { FilesProvider, User } from "@prisma/client";
import { NextApiRequest } from "next";

export async function afterCreate(user: User | null) {
  if (user === null) {
    return;
  }

  await userInfoRepo.createByUserId(user.id);
}

export async function findByEmail(email: string) {
  return userRepo.findByEmail(email);
}

export async function findByReqIdAnon(req: NextApiRequest) {
  const userId = req.cookies.anonUserId;
  if (userId === undefined) {
    return null;
  }

  return userRepo.findById(userId);
}

export async function findById(userId: string) {
  return userRepo.findById(userId);
}

export async function findByIdWithInfo(userId: string) {
  return userRepo.findByIdWithInfo(userId);
}

export async function findByKeyWords(
  userId: string | undefined,
  keyWordsData: searchUserType,
) {
  const keyWords = processKeyWordsString(keyWordsData.query);
  return userRepo.findByKeyWords(userId, keyWords, keyWordsData.page);
}

// Dangerous below

export async function updateUserInfo(userId: string, info: queryUserType) {
  const user = await findByIdWithInfo(userId);
  if (user === null) return;

  // RegistrationTargets processing
  const registrationTargets = await registrationTargetRepo.getByTargets(
    info.registrationTarget,
  );
  // To delete: new ones don't have old ones
  const registrationTargetIds = registrationTargets.map((rt) => rt.target);
  const registrationTargetConnectionsToDelete =
    user.userToRegistrationTargets.filter(
      (utrt) => !registrationTargetIds.includes(utrt.registrationTargetId),
    );
  // To create: old ones don't have new ones
  const userRegistrationTargetTexts = user.userToRegistrationTargets.map(
    (utrt) => utrt.registrationTarget.target,
  );
  const registrationTargetsToCreateConnection = registrationTargets.filter(
    (rt) => !userRegistrationTargetTexts.includes(rt.target),
  );
  // Updating
  await userRepo.updateRegistrationTargetConnections(
    user,
    registrationTargetsToCreateConnection,
    registrationTargetConnectionsToDelete,
  );

  // KeyWords processing
  // Make
  const newKeyWords = processKeyWordsString(info.keyWords);
  const newKeyWordsCreated = await keyWordRepo.findOrCreateByIds(newKeyWords);
  // To delete
  const keyWordsConnectionsToDelete = user.userToKeyWords.filter(
    (utkw) => !newKeyWords.includes(utkw.keyWordId),
  );
  await userRepo.deleteKeyWordsConnection(user, keyWordsConnectionsToDelete);
  // Order new
  const newKeyWordsOrdered = newKeyWordsCreated.map((nkw, i) => {
    return {
      keyWord: nkw,
      order: i,
    };
  });
  // Upsert with order
  await userRepo.updateKeyWordsConnections(user, newKeyWordsOrdered);

  await userRepo.updateUserInfo(userId, info);
}

export function updateImage(
  userId: string,
  avatarService: FilesProvider,
  avatarId: string,
  isAvatar: boolean,
) {
  return userRepo.updateImage(userId, avatarService, avatarId, isAvatar);
}
