/*
  Warnings:

  - Added the required column `attribute1` to the `MasterJewelTypeCustomerValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attribute2` to the `MasterJewelTypeCustomerValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `masterjeweltypecustomervalue` ADD COLUMN `attribute1` DOUBLE NOT NULL,
    ADD COLUMN `attribute2` DOUBLE NOT NULL;
