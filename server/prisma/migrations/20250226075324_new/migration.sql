/*
  Warnings:

  - Made the column `process_id` on table `attributeinfo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `attributeinfo` DROP FOREIGN KEY `attributeInfo_process_id_fkey`;

-- DropIndex
DROP INDEX `attributeInfo_process_id_fkey` ON `attributeinfo`;

-- AlterTable
ALTER TABLE `attributeinfo` MODIFY `process_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `attributeInfo` ADD CONSTRAINT `attributeInfo_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `LotProcess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
