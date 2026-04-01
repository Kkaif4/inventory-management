-- DropIndex
DROP INDEX "Attachment_moduleType_referenceId_key";

-- CreateIndex
CREATE INDEX "Attachment_moduleType_referenceId_idx" ON "Attachment"("moduleType", "referenceId");
