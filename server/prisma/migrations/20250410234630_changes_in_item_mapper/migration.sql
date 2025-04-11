-- DropForeignKey
ALTER TABLE `masterjewelitemmapper` DROP FOREIGN KEY `MasterJewelItemMapper_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `masterjewelitemmapper` DROP FOREIGN KEY `MasterJewelItemMapper_master_jewel_id_fkey`;

-- AddForeignKey
ALTER TABLE `masterjewelItemMapper` ADD CONSTRAINT `masterjewelItemMapper_master_jewel_id_fkey` FOREIGN KEY (`master_jewel_id`) REFERENCES `master_jewel_type`(`master_jewel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `masterjewelItemMapper` ADD CONSTRAINT `masterjewelItemMapper_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
