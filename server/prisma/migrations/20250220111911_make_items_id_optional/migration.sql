-- DropForeignKey
ALTER TABLE `attributevalue` DROP FOREIGN KEY `attributeValue_items_id_fkey`;

-- DropIndex
DROP INDEX `attributeValue_items_id_fkey` ON `attributevalue`;

-- AlterTable
ALTER TABLE `attributevalue` MODIFY `items_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_items_id_fkey` FOREIGN KEY (`items_id`) REFERENCES `item`(`item_id`) ON DELETE SET NULL ON UPDATE CASCADE;
