-- DropForeignKey
ALTER TABLE `balance` DROP FOREIGN KEY `Balance_order_id_fkey`;

-- DropIndex
DROP INDEX `Balance_order_id_fkey` ON `balance`;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `masterOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
