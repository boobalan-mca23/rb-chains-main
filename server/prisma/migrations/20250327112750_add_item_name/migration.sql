/*
  Warnings:

  - You are about to drop the column `item_Name` on the `attributevalue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attributevalue` DROP COLUMN `item_Name`,
    ADD COLUMN `item_name` VARCHAR(191) NULL;
