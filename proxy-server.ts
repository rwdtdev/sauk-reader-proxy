import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { InventoryItem, PrismaClient } from "@prisma/client";
import _ from "lodash";

let rfidSet2: {
  epc: string;
  timestamp: number;
  timeIn: number;
  timeOut: number | null;
}[] = [];
let itemsList: ((InventoryItem & { timeStamp: number | undefined }) | null)[] =
  [];

const prisma = new PrismaClient();

(async () => {
  // while (true) {
  setInterval(async () => {
    let rfidLeaved = rfidSet2
      .filter((item) => item.timestamp < Date.now() - 5000)
      .map((item) => ({
        ...item,
        timeOut: new Date(item.timestamp),
        timeIn: new Date(item.timeIn),
      }))
      .map((item) => _.omit(item, "timestamp"));
    console.log("🚀 ~ setInterval ~ rfidLeaved:", rfidLeaved);

    rfidSet2 = rfidSet2.filter((item) => item.timestamp > Date.now() - 5000);
    // const itemsListTemp = await Promise.all(
    //   rfidSet2.map((item) =>
    //     prisma.inventoryItem.findUnique({ where: { epc: item.epc } })
    //   )
    // ).then((res) => res.filter((item) => item !== null));

    try {
      // process leaved rfids

      const rfidLeavedInInventoryItem = await prisma.inventoryItem.findMany({
        where: {
          epc: {
            in: rfidLeaved.map((item) => item.epc),
          },
        },
      });

      rfidLeaved = rfidLeaved.filter((item) =>
        rfidLeavedInInventoryItem.some((item2) => item2.epc === item.epc)
      );

      if (rfidLeaved.length) {
        const res = await prisma.statScannerLog2.createMany({
          data: rfidLeaved,
        });
        console.log("🚀 ~ setInterval ~ res:", res);
        rfidLeaved = [];
      }

      // end process leaved rfids

      const itemsListTemp = await prisma.inventoryItem
        .findMany({
          where: {
            epc: { in: rfidSet2.map((item) => item.epc) },
          },
        })
        .then((res) => res.filter((item) => item !== null));

      itemsList = itemsListTemp.map((item) => {
        const rfid = rfidSet2.find((rfidItem) => rfidItem.epc === item?.epc);
        return { ...item, timeStamp: rfid?.timestamp };
      });

      // interact with Laurent start

      const laurentRelayOneState = await fetch(
        "http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=RDR,1"
      ).then((res) => res.text());
      console.log("🚀 ~ setInterval ~ itemsList:");

      const laurentRelayForState = await fetch(
        "http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=RDR,4"
      ).then((res) => res.text());
      console.log("🚀 ~ setInterval ~ itemsList:");

      // if (
      //   itemsList.some((item) => !item?.isTransferAllowed) &&
      //   Number(laurentRelayOneState.split(",")[2]) === 0
      // ) {
      //   fetch("http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=REL,1,1");
      //   console.log(
      //     "1111111111111",
      //     itemsList.filter((item) => !item?.isTransferAllowed)
      //   );
      // } else if (
      //   itemsList.every((item) => item?.isTransferAllowed) &&
      //   Number(laurentRelayOneState.split(",")[2]) === 1
      // ) {
      //   fetch("http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=REL,1,0");
      //   console.log("2222222222222");
      // }
      /**************** */
      /* if (
        itemsList.some((item) => item?.isTransferAllowed) &&
        Number(laurentRelayForState.split(",")[2]) === 1
      ) {
        // turn lock to open for 5 sec and back to close
        fetch("http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=REL,4,0");
        // turn light to green for 5 sec and back to red
        fetch("http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=REL,1,0");
        console.log(
          "1111111111111",
          itemsList.filter((item) => !item?.isTransferAllowed)
        );
      } else if (
        !itemsList.some((item) => item?.isTransferAllowed) &&
        Number(laurentRelayForState.split(",")[2]) === 0
      ) {
        // turn lock to open for 5 sec and back to close
        fetch("http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=REL,4,1");
        // turn light to green for 5 sec and back to red
        fetch("http://192.168.10.97/cmd.cgi?psw=Laurent&cmd=REL,1,1");
      } */

      // end interact with Laurent
    } catch (err) {
      console.error(err);
    }
  }, 1000);

  // }
})();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/piscanner", async (req, res) => {
  console.log("/api/piscanner!", req.body);

  const index = rfidSet2.findIndex((item) => item.epc === req.body.EPC);
  if (index < 0) {
    rfidSet2.push({
      epc: req.body.EPC,
      timestamp: Date.now(),
      timeIn: Date.now(),
      timeOut: null,
    });
  } else {
    rfidSet2[index] = { ...rfidSet2[index], timestamp: Date.now() };
  }

  const { ANT, EPC, RSSI, Timestamp } = req.body;

  await addStatScanerLog(ANT, EPC, new Date(), RSSI);

  await new Promise((res, rej) =>
    setTimeout(() => {
      res("ok");
    }, 1)
  );

  res.status(200).send(JSON.stringify({ message: "OK" }));
});

app.get("/api/rfidlist", (_, res) => {
  console.log("/api/rfidlist");
  res.send(itemsList);
});

app.listen(3000, () => {
  console.log("sauk proxy server listen port 3000");
});

export async function addStatScanerLog(
  antennaId: number,
  epc: string,
  eventTime: Date,
  rssi: number,
  userUid?: string
) {
  try {
    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        epc,
      },
    });
    if (!inventoryItem) {
      console.log("return!!!");
      // create inventory item
      // inventoryItem = await prisma.inventoryItem.create({
      //   data: {
      //     epc,
      //     name: "unknown",
      //     address: "unknown",
      //     uin: epc,
      //     updatedAt: new Date(),
      //   },
      // });
      return;
    }
    const res = await prisma.statScanerLog.create({
      data: {
        antennaId,
        epc,
        eventTime,
        rssi,
        userUid: userUid || null,
      },
    });
    // console.log('🚀 ~ res!!!:', res);
  } catch (err) {
    console.error(err);
  }
}
