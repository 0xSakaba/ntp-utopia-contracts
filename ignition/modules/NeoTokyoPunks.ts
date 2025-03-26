// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const input_baseTokenURI = "ipfs://";

const NeoTokyoPunksModule = buildModule("NeoTokyoPunksModule", (m) => {
  const baseTokenURI = m.getParameter("baseTokenURI", input_baseTokenURI);

  const NeoTokyoPunks = m.contract("NeoTokyoPunksNFT", [baseTokenURI]);

  return { NeoTokyoPunks };
});

export default NeoTokyoPunksModule;
