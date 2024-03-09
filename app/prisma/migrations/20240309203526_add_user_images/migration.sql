-- CreateEnum
CREATE TYPE "FilesProvider" AS ENUM ('LOCAL');

-- CreateTable
CREATE TABLE "UserImage" (
    "userId" TEXT NOT NULL,
    "imageProvider" "FilesProvider" NOT NULL,
    "imageId" TEXT NOT NULL,
    "isAvatar" BOOLEAN NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
