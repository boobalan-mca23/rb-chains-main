/*
  Warnings:

  - You are about to drop the `_itemlotinfos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_itemlotinfos` DROP FOREIGN KEY `_ItemLotInfos_A_fkey`;

-- DropForeignKey
ALTER TABLE `_itemlotinfos` DROP FOREIGN KEY `_ItemLotInfos_B_fkey`;

-- DropTable
DROP TABLE `_itemlotinfos`;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lotInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
