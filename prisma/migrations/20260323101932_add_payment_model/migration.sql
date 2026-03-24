-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "outstandingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "txnNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "referenceNo" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txnNumber_key" ON "Payment"("txnNumber");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_partyId_outletId_idx" ON "Payment"("partyId", "outletId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
