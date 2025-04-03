/*
  Warnings:

  - You are about to drop the column `process_id` on the `attributevalue` table. All the data in the column will be lost.
  - Added the required column `process_step_id` to the `attributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attributevalue` DROP FOREIGN KEY `attributeValue_lot_id_fkey`;

-- DropForeignKey
ALTER TABLE `attributevalue` DROP FOREIGN KEY `attributeValue_process_id_fkey`;

-- DropIndex
DROP INDEX `attributeValue_lot_id_fkey` ON `attributevalue`;

-- DropIndex
DROP INDEX `attributeValue_process_id_fkey` ON `attributevalue`;

-- AlterTable
ALTER TABLE `attributevalue` DROP COLUMN `process_id`,
    ADD COLUMN `process_step_id` INTEGER NOT NULL,
    MODIFY `lot_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `_LotProcessToAttributeValue` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_LotProcessToAttributeValue_AB_unique`(`A`, `B`),
    INDEX `_LotProcessToAttributeValue_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lotInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_process_step_id_fkey` FOREIGN KEY (`process_step_id`) REFERENCES `processSteps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LotProcessToAttributeValue` ADD CONSTRAINT `_LotProcessToAttributeValue_A_fkey` FOREIGN KEY (`A`) REFERENCES `attributeValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LotProcessToAttributeValue` ADD CONSTRAINT `_LotProcessToAttributeValue_B_fkey` FOREIGN KEY (`B`) REFERENCES `LotProcess`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
