/*
  Warnings:

  - You are about to drop the column `scarpDate` on the `scarpinfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lot_id]` on the table `ScarpInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lot_id` to the `ScarpInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `scarpinfo` DROP FOREIGN KEY `ScarpInfo_scarpDate_fkey`;

-- DropIndex
DROP INDEX `lotInfo_scarpDate_key` ON `lotinfo`;

-- DropIndex
DROP INDEX `ScarpInfo_scarpDate_key` ON `scarpinfo`;

-- AlterTable
ALTER TABLE `scarpinfo` DROP COLUMN `scarpDate`,
    ADD COLUMN `lot_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ScarpInfo_lot_id_key` ON `ScarpInfo`(`lot_id`);

-- AddForeignKey
ALTER TABLE `ScarpInfo` ADD CONSTRAINT `ScarpInfo_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lotInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
