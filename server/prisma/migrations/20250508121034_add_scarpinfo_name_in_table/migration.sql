-- DropForeignKey
ALTER TABLE `scarpinfo` DROP FOREIGN KEY `ScarpInfo_lot_id_fkey`;

-- AddForeignKey
ALTER TABLE `scarpInfo` ADD CONSTRAINT `scarpInfo_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lotInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `scarpinfo` RENAME INDEX `ScarpInfo_lot_id_key` TO `scarpInfo_lot_id_key`;
