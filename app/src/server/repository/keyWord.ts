import { db } from "@/server/db";
import { undefined } from "zod";

export async function findOrCreateByIds(ids: string[]) {
  return db.$transaction(
    ids.map((id) =>
      db.keyWord.upsert({
        update: {},
        where: { keyWord: id },
        create: { keyWord: id },
      }),
    ),
  );
}
