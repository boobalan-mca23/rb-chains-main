-- CreateTable
CREATE TABLE `MasterJewelType` (
    `master_jewel_id` INTEGER NOT NULL AUTO_INCREMENT,
    `jewel_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`master_jewel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterJewelTypeCustomerValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `masterJewel_id` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MasterJewelTypeCustomerValue` ADD CONSTRAINT `MasterJewelTypeCustomerValue_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MasterJewelTypeCustomerValue` ADD CONSTRAINT `MasterJewelTypeCustomerValue_masterJewel_id_fkey` FOREIGN KEY (`masterJewel_id`) REFERENCES `MasterJewelType`(`master_jewel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
