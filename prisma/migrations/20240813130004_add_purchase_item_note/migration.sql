-- CreateTable
CREATE TABLE "PurchaseItemNote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseItemNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseItemNote_itemId_idx" ON "PurchaseItemNote"("itemId");

-- CreateIndex
CREATE INDEX "PurchaseItemNote_userId_idx" ON "PurchaseItemNote"("userId");

-- AddForeignKey
ALTER TABLE "PurchaseItemNote" ADD CONSTRAINT "PurchaseItemNote_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PurchaseItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItemNote" ADD CONSTRAINT "PurchaseItemNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
