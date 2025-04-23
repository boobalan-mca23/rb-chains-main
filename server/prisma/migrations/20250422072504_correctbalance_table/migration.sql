/*
  Warnings:

  - You are about to drop the column `remaining_gold_balanace` on the `balance` table. All the data in the column will be lost.
  - Added the required column `remaining_gold_balance` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `balance` DROP COLUMN `remaining_gold_balanace`,
    ADD COLUMN `remaining_gold_balance` DOUBLE NOT NULL;
