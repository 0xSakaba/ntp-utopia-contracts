import hre from "hardhat";
import { NeoTokyoPunksUtopia } from "./typechain-types";
import { parse } from "csv-parse";
import fs from "fs";
import { getAddress, isAddress } from "ethers";

async function readWhitelistFromCSV(
  filename: string
): Promise<{ address: string[]; limit: number[] }> {
  const csvFile = fs.readFileSync(filename, "utf-8");

  return new Promise((resolve, reject) => {
    parse(
      csvFile,
      {
        skip_empty_lines: true,
      },
      async (err, records) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        const address: string[] = [];
        const limit: number[] = [];

        records.forEach((record: [string, string]) => {
          if (!isAddress(getAddress(record[0]))) {
            console.log(JSON.stringify(record[0]));
          }
          address.push(record[0]);
          limit.push(parseInt(record[1]));
        });

        resolve({ address, limit });
      }
    );
  });
}

async function main() {
  const wl1 = await readWhitelistFromCSV("./WL1.csv");
  const wl2 = await readWhitelistFromCSV("./WL2.csv");
  const wl3 = await readWhitelistFromCSV("./WL3.csv");
  const NeoTokyoPunksUtopiaFactory = await hre.ethers.getContractFactory(
    "NeoTokyoPunksUtopia"
  );
  const NeoTokyoPunksUtopia = NeoTokyoPunksUtopiaFactory.attach(
    "0x6A48451cC19BD2b404b439e6e975C097Dd472616"
  ) as NeoTokyoPunksUtopia;

  // WL 0
  await (
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      0,
      [
        "0x0383C0bDD89e915C1E2b4Ac3445a3158211056E9",
        "0x2f5a84bD155ea809fa57C443aD96392C8371Cf37",
        "0x2133e3e30F08A076D51c96B99fDD0E003044E09D",
        "0x4DF968d241aF1f78B2fbE2Ec88eb668051AbBA50",
      ],
      [2850, 750, 150, 2850]
    )
  ).wait();

  const batchSize = 1283;

  // WL 1
  for (let i = 0; i < wl1.address.length; i += batchSize) {
    const address = wl1.address.slice(i, i + batchSize);
    const limit = wl1.limit.slice(i, i + batchSize);
    await (
      await NeoTokyoPunksUtopia.batchUpdateWhitelist(1, address, limit)
    ).wait();
  }

  // WL 2
  for (let i = 0; i < wl2.address.length; i += batchSize) {
    const address = wl2.address.slice(i, i + batchSize);
    const limit = wl2.limit.slice(i, i + batchSize);
    await (
      await NeoTokyoPunksUtopia.batchUpdateWhitelist(2, address, limit)
    ).wait();
  }
  // WL 3
  for (let i = 0; i < wl3.address.length; i += batchSize) {
    const address = wl3.address.slice(i, i + batchSize);
    const limit = wl3.limit.slice(i, i + batchSize);
    await (
      await NeoTokyoPunksUtopia.batchUpdateWhitelist(3, address, limit)
    ).wait();
  }

  console.log("Whitelist updated successfully");

  // random test
  /// wl1
  {
    const sampleSize = wl1.address.length * 0.05;
    const sample = wl1.address
      .map((address, index) => ({ address, limit: wl1.limit[index] }))
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize);

    for (let i = 0; i < sample.length; i++) {
      const item = sample[i];
      const limit = await NeoTokyoPunksUtopia.mintLimit(1, item.address);
      if (limit.toString() !== item.limit.toString()) {
        console.log(
          `WL1: ${item.address} limit: ${item.limit} != ${limit.toString()}`
        );
      }
    }
  }
  /// wl2
  {
    const sampleSize = wl2.address.length * 0.05;
    const sample = wl2.address
      .map((address, index) => ({ address, limit: wl2.limit[index] }))
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize);

    for (let i = 0; i < sample.length; i++) {
      const item = sample[i];
      const limit = await NeoTokyoPunksUtopia.mintLimit(2, item.address);
      if (limit.toString() !== item.limit.toString()) {
        console.log(
          `WL2: ${item.address} limit: ${item.limit} != ${limit.toString()}`
        );
      }
    }
  }
  /// wl3
  {
    const sampleSize = wl3.address.length * 0.05;
    const sample = wl3.address
      .map((address, index) => ({ address, limit: wl3.limit[index] }))
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize);

    for (let i = 0; i < sample.length; i++) {
      const item = sample[i];
      const limit = await NeoTokyoPunksUtopia.mintLimit(3, item.address);
      if (limit.toString() !== item.limit.toString()) {
        console.log(
          `WL3: ${item.address} limit: ${item.limit} != ${limit.toString()}`
        );
      }
    }
  }
}

main();
