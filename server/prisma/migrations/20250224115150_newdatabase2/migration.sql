/*
  Warnings:

  - You are about to drop the `_attributeinfotoattributevalue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_attributeinfotoattributevalue` DROP FOREIGN KEY `_AttributeInfoToAttributeValue_A_fkey`;

-- DropForeignKey
ALTER TABLE `_attributeinfotoattributevalue` DROP FOREIGN KEY `_AttributeInfoToAttributeValue_B_fkey`;

-- DropTable
DROP TABLE `_attributeinfotoattributevalue`;

-- AddForeignKey
ALTER TABLE `attributeValue` ADD CONSTRAINT `attributeValue_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attributeInfo`(`attribute_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
