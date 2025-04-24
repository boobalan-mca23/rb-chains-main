-- DropForeignKey
ALTER TABLE `orderitems` DROP FOREIGN KEY `orderItems_stock_id_fkey`;

-- DropIndex
DROP INDEX `orderItems_stock_id_fkey` ON `orderitems`;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `ProductStocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
