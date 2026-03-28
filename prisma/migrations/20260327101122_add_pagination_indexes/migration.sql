-- CreateIndex
CREATE INDEX "Party_outletId_type_isActive_idx" ON "Party"("outletId", "type", "isActive");

-- CreateIndex
CREATE INDEX "Party_outletId_type_name_idx" ON "Party"("outletId", "type", "name");

-- CreateIndex
CREATE INDEX "Party_outletId_type_outstandingBalance_idx" ON "Party"("outletId", "type", "outstandingBalance");

-- CreateIndex
CREATE INDEX "Product_outletId_isArchived_idx" ON "Product"("outletId", "isArchived");

-- CreateIndex
CREATE INDEX "Product_outletId_categoryId_isArchived_idx" ON "Product"("outletId", "categoryId", "isArchived");

-- CreateIndex
CREATE INDEX "Transaction_outletId_type_status_idx" ON "Transaction"("outletId", "type", "status");

-- CreateIndex
CREATE INDEX "Transaction_outletId_type_date_idx" ON "Transaction"("outletId", "type", "date");

-- CreateIndex
CREATE INDEX "Transaction_outletId_type_partyId_idx" ON "Transaction"("outletId", "type", "partyId");
