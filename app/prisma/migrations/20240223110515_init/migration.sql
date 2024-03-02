-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('EMPTY', 'MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "userId" TEXT NOT NULL,
    "sex" "Sex" NOT NULL DEFAULT 'EMPTY',
    "city" TEXT,
    "birthday" TIMESTAMP(3),
    "contacts" TEXT,
    "additionalInfo" TEXT,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserToKeyWord" (
    "userId" TEXT NOT NULL,
    "keyWordId" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "KeyWord" (
    "keyWord" TEXT NOT NULL,

    CONSTRAINT "KeyWord_pkey" PRIMARY KEY ("keyWord")
);

-- CreateTable
CREATE TABLE "UserToRegistrationTarget" (
    "userId" TEXT NOT NULL,
    "registrationTargetId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RegistrationTarget" (
    "target" TEXT NOT NULL,

    CONSTRAINT "RegistrationTarget_pkey" PRIMARY KEY ("target")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserToKeyWord_userId_keyWordId_key" ON "UserToKeyWord"("userId", "keyWordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToRegistrationTarget_userId_registrationTargetId_key" ON "UserToRegistrationTarget"("userId", "registrationTargetId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToKeyWord" ADD CONSTRAINT "UserToKeyWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToKeyWord" ADD CONSTRAINT "UserToKeyWord_keyWordId_fkey" FOREIGN KEY ("keyWordId") REFERENCES "KeyWord"("keyWord") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToRegistrationTarget" ADD CONSTRAINT "UserToRegistrationTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToRegistrationTarget" ADD CONSTRAINT "UserToRegistrationTarget_registrationTargetId_fkey" FOREIGN KEY ("registrationTargetId") REFERENCES "RegistrationTarget"("target") ON DELETE RESTRICT ON UPDATE CASCADE;
