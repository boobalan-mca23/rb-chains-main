-- CreateTable
CREATE TABLE `scarpInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_id` INTEGER NOT NULL,
    `process_id` INTEGER NOT NULL,
    `scarpDate` VARCHAR(191) NOT NULL,
    `itemTotal` INTEGER NOT NULL,
    `scarp` DOUBLE NOT NULL,
    `touch` DOUBLE NULL,
    `cuttingScarp` DOUBLE NULL,
    `totalScarp` DOUBLE NOT NULL,

    UNIQUE INDEX `scarpInfo_lot_id_process_id_key`(`lot_id`, `process_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `scarpInfo` ADD CONSTRAINT `scarpInfo_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lotInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
