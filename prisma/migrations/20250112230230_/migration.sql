/*
  Warnings:

  - Made the column `createdAt` on table `Deck` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Deck` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Deck" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
