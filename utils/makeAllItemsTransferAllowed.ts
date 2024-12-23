import { InventoryItem, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const res = await prisma.inventoryItem.updateMany({
    data: {
      isTransferAllowed: true,
    },
  });

  console.log("🚀 ~ res:", res);
})();
