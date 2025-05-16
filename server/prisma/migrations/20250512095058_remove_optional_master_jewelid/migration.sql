/*
  Warnings:

  - Made the column `master_jewel_id` on table `masterjewelitemmapper` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `masterjewelitemmapper` DROP FOREIGN KEY `masterjewelItemMapper_master_jewel_id_fkey`;

-- DropIndex
DROP INDEX `masterjewelItemMapper_master_jewel_id_fkey` ON `masterjewelitemmapper`;

-- AlterTable
ALTER TABLE `masterjewelitemmapper` MODIFY `master_jewel_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `masterjewelItemMapper` ADD CONSTRAINT `masterjewelItemMapper_master_jewel_id_fkey` FOREIGN KEY (`master_jewel_id`) REFERENCES `master_jewel_type`(`master_jewel_id`) ON DELETE CASCADE ON UPDATE CASCADE;
