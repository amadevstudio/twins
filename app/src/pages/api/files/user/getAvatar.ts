import { type NextApiRequest, type NextApiResponse } from "next";
import { dir } from "@/pages/api/files/user/uploadAvatar";
import * as fs from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const imageBuffer = fs.readFileSync(`${dir}/${req.query.avatar as string}`);

  res.setHeader("Content-Type", "image/jpg");
  res.send(imageBuffer);
}
