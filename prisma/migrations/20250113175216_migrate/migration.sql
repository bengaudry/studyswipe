/*
  Warnings:

  - You are about to drop the column `decription` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Collection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "decription",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Deck" ALTER COLUMN "description" DROP NOT NULL;
