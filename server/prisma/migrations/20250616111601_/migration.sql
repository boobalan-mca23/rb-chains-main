-- DropForeignKey
ALTER TABLE `customerbalance` DROP FOREIGN KEY `customerBalance_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `receipt` DROP FOREIGN KEY `receipt_customer_id_fkey`;

-- DropIndex
DROP INDEX `receipt_customer_id_fkey` ON `receipt`;

-- AddForeignKey
ALTER TABLE `receipt` ADD CONSTRAINT `receipt_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customerBalance` ADD CONSTRAINT `customerBalance_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;
