/*
  Warnings:

  - You are about to drop the `scarpinfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `scarpinfo` DROP FOREIGN KEY `scarpInfo_lot_id_fkey`;

-- DropTable
DROP TABLE `scarpinfo`;
