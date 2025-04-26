-- DropForeignKey
ALTER TABLE `orderitems` DROP FOREIGN KEY `orderItems_order_id_fkey`;

-- DropIndex
DROP INDEX `orderItems_order_id_fkey` ON `orderitems`;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `masterOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
