/*
  Warnings:

  - A unique constraint covering the columns `[customer_id]` on the table `ClosingBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ClosingBalance_customer_id_key` ON `ClosingBalance`(`customer_id`);
