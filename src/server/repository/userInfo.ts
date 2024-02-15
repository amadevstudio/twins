import {db} from "@/server/db";

async function createByUserId(userId: string) {
  return db.userInfo.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      }
    },
  });
}

export {
  createByUserId
}
