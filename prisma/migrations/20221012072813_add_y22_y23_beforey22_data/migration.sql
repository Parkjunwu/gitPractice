-- DropForeignKey
ALTER TABLE `Diary` DROP FOREIGN KEY `Diary_musicId_fkey`;

-- CreateTable
CREATE TABLE `Y22` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `m1` JSON NULL,
    `m2` JSON NULL,
    `m3` JSON NULL,
    `m4` JSON NULL,
    `m5` JSON NULL,
    `m6` JSON NULL,
    `m7` JSON NULL,
    `m8` JSON NULL,
    `m9` JSON NULL,
    `m10` JSON NULL,
    `m11` JSON NULL,
    `m12` JSON NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Y22_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Y23` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `m1` JSON NULL,
    `m2` JSON NULL,
    `m3` JSON NULL,
    `m4` JSON NULL,
    `m5` JSON NULL,
    `m6` JSON NULL,
    `m7` JSON NULL,
    `m8` JSON NULL,
    `m9` JSON NULL,
    `m10` JSON NULL,
    `m11` JSON NULL,
    `m12` JSON NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Y23_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BeforeY22` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `m1` JSON NULL,
    `m2` JSON NULL,
    `m3` JSON NULL,
    `m4` JSON NULL,
    `m5` JSON NULL,
    `m6` JSON NULL,
    `m7` JSON NULL,
    `m8` JSON NULL,
    `m9` JSON NULL,
    `m10` JSON NULL,
    `m11` JSON NULL,
    `m12` JSON NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `BeforeY22_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_musicId_fkey` FOREIGN KEY (`musicId`) REFERENCES `Music`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Y22` ADD CONSTRAINT `Y22_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Y23` ADD CONSTRAINT `Y23_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BeforeY22` ADD CONSTRAINT `BeforeY22_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
