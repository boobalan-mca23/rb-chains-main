-- CreateTable
CREATE TABLE `receipt` (
    `receipt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `goldRate` DOUBLE NOT NULL,
    `givenGold` DOUBLE NOT NULL,
    `touch` DOUBLE NOT NULL,
    `purityWeight` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `customer_id` INTEGER NOT NULL,

    PRIMARY KEY (`receipt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `receipt` ADD CONSTRAINT `receipt_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
