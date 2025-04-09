// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { MaxUint256, parseEther } from "ethers";

const NeoTokyoPunksModule = buildModule("NeoTokyoPunksUtopiaModule", (m) => {
  const startTime = [
    new Date("2025-04-09T05:00:00Z").getTime() / 1000,
    new Date("2025-04-09T05:30:00Z").getTime() / 1000,
    new Date("2025-04-09T06:00:00Z").getTime() / 1000,
    new Date("2025-04-09T06:30:00Z").getTime() / 1000,
    new Date("2025-04-09T06:40:00Z").getTime() / 1000,
    new Date("2025-04-09T07:10:00Z").getTime() / 1000,
  ];
  const NeoTokyoPunks = m.contract("NeoTokyoPunksUtopia", [
    "0xEecD02C2E160516aD2bd0e089e7d6d83D558cA25",
    startTime,
    [
      parseEther("0.009"),
      parseEther("0.011"),
      MaxUint256,
      parseEther("0.011"),
      parseEther("0.013"),
    ],
    [
      parseEther("575"),
      parseEther("700"),
      MaxUint256,
      parseEther("700"),
      parseEther("830"),
    ],
    [4500, 3500, 0, 3000],
    "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e?",
  ]);

  return { NeoTokyoPunks };
});

export default NeoTokyoPunksModule;
