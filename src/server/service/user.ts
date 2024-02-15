import { AdapterUser } from "next-auth/adapters";
import * as userRepo from "@/server/repository/user";
import * as userInfoRepo from "@/server/repository/userInfo";

export default async function afterCreateUser(adapterUser: AdapterUser) {
  const user = await userRepo.findById(adapterUser.id)
  await userInfoRepo.createByUserId(user!.id)
}
