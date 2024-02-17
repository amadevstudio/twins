import { AdapterUser } from "next-auth/adapters";
import * as userRepo from "@/server/repository/user";
import * as userInfoRepo from "@/server/repository/userInfo";
import { queryUserType } from "@/server/api/types/user";
import * as registrationTargetRepo from "@/server/repository/registrationTarget";
import * as keyWordRepo from "@/server/repository/keyWord";
import {processKeyWordsString} from "@/server/service/keyWord";

export async function afterCreate(adapterUser: AdapterUser) {
  const user = await userRepo.findById(adapterUser.id);
  await userInfoRepo.createByUserId(user!.id);
}

export async function findById(userId: string) {
  return userRepo.findById(userId);
}

export async function findByIdWithInfo(userId: string) {
  return userRepo.findByIdWithInfo(userId);
}

export async function updateUserInfo(userId: string, info: queryUserType) {
  const user = await findByIdWithInfo(userId);
  if (user === null) return;

  // RegistrationTargets processing
  const registrationTargets = await registrationTargetRepo.getByTargets(
    info.registrationTarget,
  );
  // To delete: new ones don't have old ones
  const registrationTargetIds = registrationTargets.map(rt => rt.target);
  const registrationTargetConnectionsToDelete =
    user.userToRegistrationTargets.filter(
      (utrt) => !registrationTargetIds.includes(utrt.registrationTargetId)
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
  const newKeyWords = processKeyWordsString(info.keyWords)
  const newkeyWordsCreated = await keyWordRepo.findOrCreateByIds(newKeyWords)
  // To delete
  const keyWordsConnectionsToDelete = user.userToKeyWords.filter(
    (utkw) => !newKeyWords.includes(utkw.keyWordId),
  );
  await userRepo.deleteKeyWordsConnection(user, keyWordsConnectionsToDelete);
  // Order new
  const newKeyWordsOrdered = newkeyWordsCreated.map((nkw, i) => {
    return {
      keyWord: nkw,
      order: i
    }
  })
  // Upsert with order
  await userRepo.updateKeyWordsConnections(user, newKeyWordsOrdered)

  await userRepo.updateUserInfo(userId, info);
}
