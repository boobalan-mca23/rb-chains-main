/*
  Warnings:

  - You are about to drop the `masterjeweltype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `masterjeweltypecustomervalue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `masterjeweltypecustomervalue` DROP FOREIGN KEY `MasterJewelTypeCustomerValue_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `masterjeweltypecustomervalue` DROP FOREIGN KEY `MasterJewelTypeCustomerValue_masterJewel_id_fkey`;

-- DropTable
DROP TABLE `masterjeweltype`;

-- DropTable
DROP TABLE `masterjeweltypecustomervalue`;

-- CreateTable
CREATE TABLE `master_jewel_type` (
    `master_jewel_id` INTEGER NOT NULL AUTO_INCREMENT,
    `jewel_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`master_jewel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_jewel_type_customer_value` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `masterJewel_id` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,
    `attribute1` DOUBLE NOT NULL,
    `attribute2` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterJewelItemMapper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `master_jewel_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `master_jewel_type_customer_value` ADD CONSTRAINT `master_jewel_type_customer_value_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_jewel_type_customer_value` ADD CONSTRAINT `master_jewel_type_customer_value_masterJewel_id_fkey` FOREIGN KEY (`masterJewel_id`) REFERENCES `master_jewel_type`(`master_jewel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MasterJewelItemMapper` ADD CONSTRAINT `MasterJewelItemMapper_master_jewel_id_fkey` FOREIGN KEY (`master_jewel_id`) REFERENCES `master_jewel_type`(`master_jewel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MasterJewelItemMapper` ADD CONSTRAINT `MasterJewelItemMapper_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
