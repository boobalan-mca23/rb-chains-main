/*
  Warnings:

  - Added the required column `attribute_id` to the `attributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attributevalue` ADD COLUMN `attribute_id` INTEGER NOT NULL;
