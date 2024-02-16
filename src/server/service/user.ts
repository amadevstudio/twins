import { AdapterUser } from "next-auth/adapters";
import * as userRepo from "@/server/repository/user";
import * as userInfoRepo from "@/server/repository/userInfo";
import {queryUserType} from "@/server/api/types/user";

export async function afterCreate(adapterUser: AdapterUser) {
  const user = await userRepo.findById(adapterUser.id)
  await userInfoRepo.createByUserId(user!.id)
}

export async function findById(userId: string) {
  return userRepo.findById(userId)
}

export async function findByIdWithInfo(userId: string) {
  return userRepo.findByIdWithInfo(userId)
}

export async function updateUserInfo(userId: string, info: queryUserType) {
  return userRepo.updateUserInfo(userId, info);
}
