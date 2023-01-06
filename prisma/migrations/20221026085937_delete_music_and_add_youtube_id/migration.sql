/*
  Warnings:

  - You are about to drop the column `musicId` on the `Diary` table. All the data in the column will be lost.
  - You are about to drop the `Music` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Diary` DROP FOREIGN KEY `Diary_musicId_fkey`;

-- AlterTable
ALTER TABLE `Diary` DROP COLUMN `musicId`,
    ADD COLUMN `youtubeId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Music`;
