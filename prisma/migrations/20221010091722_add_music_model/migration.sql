/*
  Warnings:

  - You are about to drop the column `musicUrl` on the `Diary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Diary` DROP COLUMN `musicUrl`,
    ADD COLUMN `musicId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Music` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_musicId_fkey` FOREIGN KEY (`musicId`) REFERENCES `Music`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
