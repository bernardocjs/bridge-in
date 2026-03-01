/*
  Warnings:

  - You are about to drop the column `companyId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropIndex
DROP INDEX "Company_magicLinkSlug_idx";

-- DropIndex
DROP INDEX "User_companyId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyId";

-- CreateTable
CREATE TABLE "CompanyMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "CompanyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyMembership_companyId_status_idx" ON "CompanyMembership"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMembership_userId_key" ON "CompanyMembership"("userId");

-- CreateIndex
CREATE INDEX "Report_companyId_createdAt_idx" ON "Report"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
