-- CreateTable
CREATE TABLE `customerBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `expure` DOUBLE NULL,
    `balance` DOUBLE NULL,

    UNIQUE INDEX `customerBalance_customer_id_key`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customerBalance` ADD CONSTRAINT `customerBalance_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
