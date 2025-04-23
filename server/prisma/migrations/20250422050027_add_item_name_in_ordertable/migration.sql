/*
  Warnings:

  - You are about to drop the column `givenGold` on the `orderitems` table. All the data in the column will be lost.
  - Added the required column `itemName` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productPure` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productWeight` to the `orderItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orderitems` DROP COLUMN `givenGold`,
    ADD COLUMN `itemName` VARCHAR(191) NOT NULL,
    ADD COLUMN `productPure` DOUBLE NOT NULL,
    ADD COLUMN `productWeight` DOUBLE NOT NULL;
