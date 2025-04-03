/*
  Warnings:

  - You are about to drop the column `process_step_id` on the `attributevalue` table. All the data in the column will be lost.
  - You are about to drop the `_lotprocesstoattributevalue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_lotprocesstoattributevalue` DROP FOREIGN KEY `_LotProcessToAttributeValue_A_fkey`;

-- DropForeignKey
ALTER TABLE `_lotprocesstoattributevalue` DROP FOREIGN KEY `_LotProcessToAttributeValue_B_fkey`;

-- DropForeignKey
ALTER TABLE `attributevalue` DROP FOREIGN KEY `attributeValue_process_step_id_fkey`;

-- DropIndex
DROP INDEX `attributeValue_process_step_id_fkey` ON `attributevalue`;

-- AlterTable
ALTER TABLE `attributevalue` DROP COLUMN `process_step_id`,
    ADD COLUMN `process_id` INTEGER NULL;

-- DropTable
DROP TABLE `_lotprocesstoattributevalue`;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `LotProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
