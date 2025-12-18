/*
  Warnings:

  - You are about to drop the column `ingTemplates` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "ingTemplates",
ADD COLUMN     "pingTemplates" TEXT[] DEFAULT ARRAY['Hey man, hows it going']::TEXT[];
