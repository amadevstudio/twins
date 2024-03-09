import {db} from "@/server/db";

async function createByUserId(userId: string) {
  return db.userInfo.upsert({
    where: {
      userId: userId
    },
    create: {
      user: {
        connect: {
          id: userId
        }
      }
    },
    update: {}
  });
}

export {
  createByUserId
}
