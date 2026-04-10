-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TxStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "TxStatus" ADD VALUE 'REJECTED';
ALTER TYPE "TxStatus" ADD VALUE 'PARTIALLY_PAID';
ALTER TYPE "TxStatus" ADD VALUE 'POSTED';
ALTER TYPE "TxStatus" ADD VALUE 'PAID';
ALTER TYPE "TxStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "TxStatus" ADD VALUE 'RECEIVED';
ALTER TYPE "TxStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "TxStatus" ADD VALUE 'CONVERTED';
