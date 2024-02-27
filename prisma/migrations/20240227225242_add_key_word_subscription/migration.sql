-- CreateEnum
CREATE TYPE "KeyWordsSubscriptionStatuses" AS ENUM ('NEW', 'CANCELED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "UserToRegistrationTarget" DROP CONSTRAINT "UserToRegistrationTarget_registrationTargetId_fkey";

-- DropForeignKey
ALTER TABLE "UserToRegistrationTarget" DROP CONSTRAINT "UserToRegistrationTarget_userId_fkey";

-- CreateTable
CREATE TABLE "KeyWordsSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KeyWordsSubscriptionStatuses" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "KeyWordsSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyWordsSubscriptionToKeyWord" (
    "keyWordSubscriptionId" TEXT NOT NULL,
    "keyWordId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyWordsSubscriptionToKeyWord_keyWordSubscriptionId_keyWord_key" ON "KeyWordsSubscriptionToKeyWord"("keyWordSubscriptionId", "keyWordId");

-- AddForeignKey
ALTER TABLE "KeyWordsSubscription" ADD CONSTRAINT "KeyWordsSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWordsSubscriptionToKeyWord" ADD CONSTRAINT "KeyWordsSubscriptionToKeyWord_keyWordSubscriptionId_fkey" FOREIGN KEY ("keyWordSubscriptionId") REFERENCES "KeyWordsSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWordsSubscriptionToKeyWord" ADD CONSTRAINT "KeyWordsSubscriptionToKeyWord_keyWordId_fkey" FOREIGN KEY ("keyWordId") REFERENCES "KeyWord"("keyWord") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToRegistrationTarget" ADD CONSTRAINT "UserToRegistrationTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToRegistrationTarget" ADD CONSTRAINT "UserToRegistrationTarget_registrationTargetId_fkey" FOREIGN KEY ("registrationTargetId") REFERENCES "RegistrationTarget"("target") ON DELETE CASCADE ON UPDATE CASCADE;
