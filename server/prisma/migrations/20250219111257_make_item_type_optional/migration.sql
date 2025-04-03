-- CreateTable
CREATE TABLE `lotInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_name` VARCHAR(191) NOT NULL,
    `lot_before_weight` DOUBLE NULL,
    `lot_after_weight` DOUBLE NULL,
    `lot_difference_weight` DOUBLE NULL,
    `lot_comments` VARCHAR(191) NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `master_id` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customerInfo` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_shop_name` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,

    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `masterProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `process_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `masterProcessMapper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `master_id` INTEGER NOT NULL,
    `process_id` INTEGER NOT NULL,
    `process_order_sort` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attributeInfo` (
    `attribute_id` INTEGER NOT NULL AUTO_INCREMENT,
    `attribute_type` VARCHAR(191) NOT NULL,
    `attribute_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`attribute_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `process_name` VARCHAR(191) NOT NULL,
    `process_description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `processSteps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `process_id` INTEGER NOT NULL,
    `attribute_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attributeValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_id` INTEGER NOT NULL,
    `process_id` INTEGER NOT NULL,
    `items_id` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_id` INTEGER NOT NULL,
    `item_type` VARCHAR(191) NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductStocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `product_status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `masterOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_status` VARCHAR(191) NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `stock_id` INTEGER NOT NULL,
    `final_price` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MasterProcessToProcessSteps` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MasterProcessToProcessSteps_AB_unique`(`A`, `B`),
    INDEX `_MasterProcessToProcessSteps_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttributeInfoToAttributeValue` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AttributeInfoToAttributeValue_AB_unique`(`A`, `B`),
    INDEX `_AttributeInfoToAttributeValue_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ItemLotInfos` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ItemLotInfos_AB_unique`(`A`, `B`),
    INDEX `_ItemLotInfos_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lotInfo` ADD CONSTRAINT `lotInfo_master_id_fkey` FOREIGN KEY (`master_id`) REFERENCES `masterProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `masterProcessMapper` ADD CONSTRAINT `masterProcessMapper_master_id_fkey` FOREIGN KEY (`master_id`) REFERENCES `masterProcess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `masterProcessMapper` ADD CONSTRAINT `masterProcessMapper_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `LotProcess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `processSteps` ADD CONSTRAINT `processSteps_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `LotProcess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `processSteps` ADD CONSTRAINT `processSteps_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attributeInfo`(`attribute_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lotInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `LotProcess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_items_id_fkey` FOREIGN KEY (`items_id`) REFERENCES `item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductStocks` ADD CONSTRAINT `ProductStocks_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `masterOrder` ADD CONSTRAINT `masterOrder_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `masterOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MasterProcessToProcessSteps` ADD CONSTRAINT `_MasterProcessToProcessSteps_A_fkey` FOREIGN KEY (`A`) REFERENCES `masterProcess`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MasterProcessToProcessSteps` ADD CONSTRAINT `_MasterProcessToProcessSteps_B_fkey` FOREIGN KEY (`B`) REFERENCES `processSteps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeInfoToAttributeValue` ADD CONSTRAINT `_AttributeInfoToAttributeValue_A_fkey` FOREIGN KEY (`A`) REFERENCES `attributeInfo`(`attribute_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeInfoToAttributeValue` ADD CONSTRAINT `_AttributeInfoToAttributeValue_B_fkey` FOREIGN KEY (`B`) REFERENCES `attributeValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemLotInfos` ADD CONSTRAINT `_ItemLotInfos_A_fkey` FOREIGN KEY (`A`) REFERENCES `item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemLotInfos` ADD CONSTRAINT `_ItemLotInfos_B_fkey` FOREIGN KEY (`B`) REFERENCES `lotInfo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
