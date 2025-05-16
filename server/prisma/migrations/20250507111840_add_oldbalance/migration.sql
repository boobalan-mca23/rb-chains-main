/*
  Warnings:

  - Added the required column `oldBalance` to the `masterOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `masterorder` ADD COLUMN `oldBalance` DOUBLE NOT NULL;
