/*
  Warnings:

  - You are about to drop the column `lastNotificationReadTime` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `lastNotificationReadTime`,
    ADD COLUMN `lastReadNotificationId` INTEGER NULL;
