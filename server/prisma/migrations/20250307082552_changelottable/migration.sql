/*
  Warnings:

  - You are about to drop the column `is_completed` on the `lotinfo` table. All the data in the column will be lost.
  - You are about to drop the column `lot_after_weight` on the `lotinfo` table. All the data in the column will be lost.
  - You are about to drop the column `lot_before_weight` on the `lotinfo` table. All the data in the column will be lost.
  - You are about to drop the column `lot_comments` on the `lotinfo` table. All the data in the column will be lost.
  - You are about to drop the column `lot_difference_weight` on the `lotinfo` table. All the data in the column will be lost.
  - You are about to drop the column `lot_name` on the `lotinfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `lotinfo` DROP COLUMN `is_completed`,
    DROP COLUMN `lot_after_weight`,
    DROP COLUMN `lot_before_weight`,
    DROP COLUMN `lot_comments`,
    DROP COLUMN `lot_difference_weight`,
    DROP COLUMN `lot_name`,
    ADD COLUMN `lot_initial_weight` DOUBLE NULL;
