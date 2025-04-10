import { vars, type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

const config: HardhatUserConfig = {
  sourcify: {
    enabled: true,
    // Optional: specify a different Sourcify server
    apiUrl: "https://sourcify.dev/server",
    // Optional: specify a different Sourcify repository
    browserUrl: "https://repo.sourcify.dev",
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      "soneium-minato": "empty",
      soneium: "empty",
    },
    customChains: [
      {
        network: "soneium",
        chainId: 1868,
        urls: {
          apiURL: "https://soneium.blockscout.com/api",
          browserURL: "https://soneium.blockscout.com",
        },
      },
      {
        network: "soneium-minato",
        chainId: 1946,
        urls: {
          apiURL: "https://soneium-minato.blockscout.com/api",
          browserURL: "https://soneium-minato.blockscout.com",
        },
      },
    ],
  },
  networks: {
    hardhat: {
      initialDate: "2025-04-09T00:00:00Z",
    },
    soneium: {
      url: "https://rpc.soneium.org",
      chainId: 1868,
      accounts: [vars.get("NTO_UTOPIA_PRIVATE_KEY")],
    },
    "soneium-minato": {
      url: "https://rpc.minato.soneium.org/",
      chainId: 1946,
      accounts: [vars.get("NTO_UTOPIA_PRIVATE_KEY")],
    },
  },
};

export default config;
