import sharp from "sharp";
import { constants } from "@/constants";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { env } from "@/env";
import * as fs from "fs";
import { getSession } from "next-auth/react";
import * as userService from "@/server/service/user";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  message?: string;
  error?: string;
};

export const dir = `${env.UPLOAD_PATH}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    const session = await getSession({ req });
    if (session?.user?.id === undefined) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = session.user.id;

    const form = formidable({
      maxFiles: 1,
      maxFileSize: constants.MAX_IMAGE_SIZE_MB * 1_048_576, // 1024 * 1024,
    });
    const filesList = (await form.parse(req))[1].image;
    if (
      filesList === undefined ||
      filesList.length != 1 ||
      filesList[0] === undefined
    ) {
      throw new Error("Wrong file length");
    }

    const file = filesList[0];
    const prefix = "images/avatars";
    const outputFileName = `${prefix}/${userId}.jpg`;

    if (!fs.existsSync(`${dir}/${prefix}`)) {
      fs.mkdirSync(`${dir}/${prefix}`, { recursive: true });
    }

    await sharp(file.filepath)
      .jpeg({ quality: 60 })
      .toFile(`${dir}/${outputFileName}`);

    await userService.updateImage(userId, "LOCAL", outputFileName, true);

    return res.status(200).json({ message: "Upload successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
