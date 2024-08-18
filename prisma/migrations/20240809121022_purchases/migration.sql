-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "purchaseRepresentative" TEXT NOT NULL,
    "purchaseRepresentativeId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PurchaseItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PurchaseItems_AB_unique" ON "_PurchaseItems"("A", "B");

-- CreateIndex
CREATE INDEX "_PurchaseItems_B_index" ON "_PurchaseItems"("B");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseItems" ADD CONSTRAINT "_PurchaseItems_A_fkey" FOREIGN KEY ("A") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseItems" ADD CONSTRAINT "_PurchaseItems_B_fkey" FOREIGN KEY ("B") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
