import { db } from "@/server/db";

export async function getAll() {
  return db.registrationTarget.findMany();
}
