/*
  Warnings:

  - Added the required column `scarpDate` to the `ScarpInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scarpinfo` ADD COLUMN `scarpDate` VARCHAR(191) NOT NULL;
