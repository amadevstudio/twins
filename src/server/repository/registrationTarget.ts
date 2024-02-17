import { db } from "@/server/db";

export async function getAll() {
  return db.registrationTarget.findMany();
}

export async function getByTargets(ids: string[]) {
  return db.registrationTarget.findMany({
    where: {
      target: {
        in: ids
      }
    }
  })
}
