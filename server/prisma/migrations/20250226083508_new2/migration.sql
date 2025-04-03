/*
  Warnings:

  - You are about to drop the column `process_id` on the `attributeinfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `attributeinfo` DROP FOREIGN KEY `attributeInfo_process_id_fkey`;

-- DropIndex
DROP INDEX `attributeInfo_process_id_fkey` ON `attributeinfo`;

-- AlterTable
ALTER TABLE `attributeinfo` DROP COLUMN `process_id`;
