/*
  Warnings:

  - Added the required column `touchValue` to the `attributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attributevalue` ADD COLUMN `touchValue` DOUBLE NOT NULL;
