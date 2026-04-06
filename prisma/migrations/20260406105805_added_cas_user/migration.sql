-- CreateTable
CREATE TABLE "CasUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "stripeCustomerId" TEXT,
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "casCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CasUser_email_key" ON "CasUser"("email");
