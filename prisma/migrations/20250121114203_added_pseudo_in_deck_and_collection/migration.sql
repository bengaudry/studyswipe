/*
  Warnings:

  - Added the required column `ownerPseudo` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerPseudo` to the `Deck` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "ownerPseudo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "ownerPseudo" TEXT NOT NULL;
