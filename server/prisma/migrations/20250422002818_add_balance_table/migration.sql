/*
  Warnings:

  - You are about to alter the column `final_price` on the `orderitems` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - Added the required column `givenGold` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `touchValue` to the `orderItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orderitems` ADD COLUMN `givenGold` DOUBLE NOT NULL,
    ADD COLUMN `touchValue` DOUBLE NOT NULL,
    MODIFY `final_price` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `Balance` (
    `balance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `gold_weight` DOUBLE NOT NULL,
    `gold_touch` DOUBLE NOT NULL,
    `gold_pure` DOUBLE NOT NULL,
    `remaining_gold_balanace` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`balance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClosingBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `closing_balance` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `masterOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClosingBalance` ADD CONSTRAINT `ClosingBalance_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customerInfo`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
