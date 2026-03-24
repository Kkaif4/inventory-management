-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankIfsc" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "openingBalanceLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT;
