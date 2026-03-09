-- AlterEnum
ALTER TYPE "TxType" ADD VALUE 'QUOTATION';

-- CreateTable
CREATE TABLE "VendorProduct" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "lastPrice" DOUBLE PRECISION,
    "leadTime" INTEGER,

    CONSTRAINT "VendorProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorProduct_vendorId_variantId_key" ON "VendorProduct"("vendorId", "variantId");

-- AddForeignKey
ALTER TABLE "VendorProduct" ADD CONSTRAINT "VendorProduct_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProduct" ADD CONSTRAINT "VendorProduct_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
