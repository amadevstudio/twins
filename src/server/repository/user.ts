import {db} from "@/server/db";

async function findById(userId: string) {
  return db.user.findFirst({where: {id: userId}});
}

export {
  findById
}
