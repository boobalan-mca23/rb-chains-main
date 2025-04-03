/*
  Warnings:

  - You are about to drop the column `lot_process_id` on the `attributeinfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `attributeinfo` DROP FOREIGN KEY `attributeInfo_lot_process_id_fkey`;

-- DropIndex
DROP INDEX `attributeInfo_lot_process_id_fkey` ON `attributeinfo`;

-- AlterTable
ALTER TABLE `attributeinfo` DROP COLUMN `lot_process_id`,
    ADD COLUMN `process_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `attributeInfo` ADD CONSTRAINT `attributeInfo_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `LotProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
