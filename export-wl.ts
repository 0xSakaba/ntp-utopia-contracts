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

  fs.writeFileSync("./wl1.json", JSON.stringify(wl1.address));
  fs.writeFileSync("./wl2.json", JSON.stringify(wl2.address));
  fs.writeFileSync("./wl3.json", JSON.stringify(wl3.address));
}

main();
