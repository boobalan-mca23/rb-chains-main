-- AlterTable
ALTER TABLE `attributeinfo` ADD COLUMN `lot_process_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `attributeInfo` ADD CONSTRAINT `attributeInfo_lot_process_id_fkey` FOREIGN KEY (`lot_process_id`) REFERENCES `LotProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
