// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const NeoTokyoPunksModule = buildModule("NeoTokyoPunksUtopiaModule", (m) => {
  const startTime = [
    new Date("2025-04-11T08:00:00Z").getTime() / 1000, // wl0
    new Date("2025-04-11T10:00:00Z").getTime() / 1000, // gap
    new Date("2025-04-11T11:00:00Z").getTime() / 1000, // wl1-1
    new Date("2025-04-11T13:00:00Z").getTime() / 1000, // wl1-2
    new Date("2025-04-11T14:00:00Z").getTime() / 1000, // wl2
    new Date("2025-04-11T16:00:00Z").getTime() / 1000, // gap
    new Date("2025-04-12T11:00:00Z").getTime() / 1000, // wl3
    new Date("2025-04-12T13:00:00Z").getTime() / 1000, // public
  ];

  const testStartTime = [
    new Date("2025-04-10T06:30:00Z").getTime() / 1000, // wl0
    new Date("2025-04-10T08:30:00Z").getTime() / 1000, // gap
    new Date("2025-04-10T08:35:00Z").getTime() / 1000, // wl1-1
    new Date("2025-04-10T08:45:00Z").getTime() / 1000, // wl1-2
    new Date("2025-04-10T09:00:00Z").getTime() / 1000, // wl2
    new Date("2025-04-10T09:15:00Z").getTime() / 1000, // gap
    new Date("2025-04-10T09:30:00Z").getTime() / 1000, // wl3
    new Date("2025-04-10T10:00:00Z").getTime() / 1000, // public
  ];
  const NeoTokyoPunks = m.contract("NeoTokyoPunksUtopia", [
    "0xEecD02C2E160516aD2bd0e089e7d6d83D558cA25",
    testStartTime,
    [
      parseEther("0.009"),
      parseEther("0.011"),
      parseEther("0.011"),
      parseEther("0.013"),
    ],
    [
      parseEther("575"),
      parseEther("700"),
      parseEther("700"),
      parseEther("830"),
    ],
    [3750, 4500, 3500, 3000],
    "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e?",
  ]);

  return { NeoTokyoPunks };
});

export default NeoTokyoPunksModule;
