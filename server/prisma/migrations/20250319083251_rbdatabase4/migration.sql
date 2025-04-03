/*
  Warnings:

  - You are about to drop the column `process_id` on the `attributevalue` table. All the data in the column will be lost.
  - Added the required column `process_step_id` to the `attributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attributevalue` DROP FOREIGN KEY `attributeValue_process_id_fkey`;

-- DropIndex
DROP INDEX `attributeValue_process_id_fkey` ON `attributevalue`;

-- AlterTable
ALTER TABLE `attributevalue` DROP COLUMN `process_id`,
    ADD COLUMN `process_step_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_process_step_id_fkey` FOREIGN KEY (`process_step_id`) REFERENCES `processSteps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
