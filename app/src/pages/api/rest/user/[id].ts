import { type NextApiRequest, type NextApiResponse } from "next";
import * as userService from "@/server/service/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const result = await userService.findById(req.query.id as string);
    res.status(200).send({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch data" });
  }
}
