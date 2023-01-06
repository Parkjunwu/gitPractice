/*
  Warnings:

  - You are about to drop the column `date` on the `Diary` table. All the data in the column will be lost.
  - Added the required column `dateTime` to the `Diary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Diary` DROP COLUMN `date`,
    ADD COLUMN `dateTime` INTEGER NOT NULL;
