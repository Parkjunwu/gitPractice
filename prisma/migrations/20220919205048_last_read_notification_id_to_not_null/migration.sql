/*
  Warnings:

  - Made the column `lastReadNotificationId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `lastReadNotificationId` INTEGER NOT NULL DEFAULT 0;
