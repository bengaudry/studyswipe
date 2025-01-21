/*
  Warnings:

  - You are about to drop the column `ownerPseudo` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `ownerPseudo` on the `Deck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "ownerPseudo";

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "ownerPseudo";
