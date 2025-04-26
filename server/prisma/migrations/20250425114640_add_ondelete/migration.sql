-- DropForeignKey
ALTER TABLE `balance` DROP FOREIGN KEY `Balance_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `closingbalance` DROP FOREIGN KEY `ClosingBalance_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `master_jewel_type_customer_value` DROP FOREIGN KEY `master_jewel_type_customer_value_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `master_jewel_type_customer_value` DROP FOREIGN KEY `master_jewel_type_customer_value_masterJewel_id_fkey`;

-- DropForeignKey
ALTER TABLE `masterjewelitemmapper` DROP FOREIGN KEY `masterjewelItemMapper_master_jewel_id_fkey`;

-- DropForeignKey
ALTER TABLE `masterorder` DROP FOREIGN KEY `masterOrder_customer_id_fkey`;

-- DropIndex
DROP INDEX `Balance_customer_id_fkey` ON `balance`;

-- DropIndex
DROP INDEX `master_jewel_type_customer_value_customer_id_fkey` ON `master_jewel_type_customer_value`;

-- DropIndex
DROP INDEX `master_jewel_type_customer_value_masterJewel_id_fkey` ON `master_jewel_type_customer_value`;

-- DropIndex
DROP INDEX `masterjewelItemMapper_master_jewel_id_fkey` ON `masterjewelitemmapper`;

-- DropIndex
DROP INDEX `masterOrder_customer_id_fkey` ON `masterorder`;

-- AddForeignKey
ALTER TABLE `masterOrder` ADD CONSTRAINT `masterOrder_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_jewel_type_customer_value` ADD CONSTRAINT `master_jewel_type_customer_value_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_jewel_type_customer_value` ADD CONSTRAINT `master_jewel_type_customer_value_masterJewel_id_fkey` FOREIGN KEY (`masterJewel_id`) REFERENCES `master_jewel_type`(`master_jewel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `masterjewelItemMapper` ADD CONSTRAINT `masterjewelItemMapper_master_jewel_id_fkey` FOREIGN KEY (`master_jewel_id`) REFERENCES `master_jewel_type`(`master_jewel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClosingBalance` ADD CONSTRAINT `ClosingBalance_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;
