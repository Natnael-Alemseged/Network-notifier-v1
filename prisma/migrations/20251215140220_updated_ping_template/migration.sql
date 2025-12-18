/*
  Warnings:

  - You are about to drop the column `pingTemplates` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "pingTemplates",
ADD COLUMN     "ingTemplates" TEXT[] DEFAULT ARRAY['Hey man, hows it going']::TEXT[];
