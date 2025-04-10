import hre from "hardhat";
import { NeoTokyoPunksUtopia } from "./typechain-types";

async function main() {
  const NeoTokyoPunksUtopiaFactory = await hre.ethers.getContractFactory(
    "NeoTokyoPunksUtopia"
  );
  const NeoTokyoPunksUtopia = NeoTokyoPunksUtopiaFactory.attach(
    "0x8dc5B3eB0fa1e9c5eF366519F5d0836b3e695fFf"
  ) as NeoTokyoPunksUtopia;
  // WL 1
  await (
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      0,
      ["0x4df968d241af1f78b2fbe2ec88eb668051abba50"],
      [5]
    )
  ).wait();

  // WL 2
  await (
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      2,
      ["0x4DF968d241aF1f78B2fbE2Ec88eb668051AbBA50"],
      [5]
    )
  ).wait();

  // WL 3
  await (
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      4,
      ["0x4DF968d241aF1f78B2fbE2Ec88eb668051AbBA50"],
      [5]
    )
  ).wait();
}

main();
