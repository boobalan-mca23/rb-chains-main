/*
  Warnings:

  - A unique constraint covering the columns `[scarpDate]` on the table `lotInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scarpDate` to the `lotInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lotinfo` ADD COLUMN `scarpDate` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ScarpInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scarpDate` VARCHAR(191) NOT NULL,
    `itemTotal` INTEGER NOT NULL,
    `scarp` DOUBLE NOT NULL,
    `totalScarp` DOUBLE NOT NULL,

    UNIQUE INDEX `ScarpInfo_scarpDate_key`(`scarpDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `lotInfo_scarpDate_key` ON `lotInfo`(`scarpDate`);

-- AddForeignKey
ALTER TABLE `ScarpInfo` ADD CONSTRAINT `ScarpInfo_scarpDate_fkey` FOREIGN KEY (`scarpDate`) REFERENCES `lotInfo`(`scarpDate`) ON DELETE RESTRICT ON UPDATE CASCADE;
