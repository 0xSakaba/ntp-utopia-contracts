import {
  mine,
  SnapshotRestorer,
  takeSnapshot,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther, Signer } from "ethers";
import hre from "hardhat";
import { MockErc20, NeoTokyoPunksUtopia } from "../typechain-types";
import { increaseTo } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

const ETH_PRICES: [bigint, bigint, bigint, bigint] = [
  parseEther("0.009"),
  parseEther("0.011"),
  parseEther("0.011"),
  parseEther("0.013"),
];
const ASTAR_PRICES: [bigint, bigint, bigint, bigint] = [
  parseEther("575"),
  parseEther("700"),
  parseEther("700"),
  parseEther("830"),
] as const;

describe("NeoTokyoPunksUtopia", function () {
  let NeoTokyoPunksUtopia: NeoTokyoPunksUtopia;
  let MockErc20: MockErc20;
  let owner: Signer;
  let addrs: Signer[];
  let startTime: [number, number, number, number, number];

  beforeEach(async function () {
    const current = Math.floor(new Date().getTime() / 1000);
    startTime = [
      current + 900,
      current + 1800,
      current + 2700,
      current + 3600,
      current + 4500,
    ];

    addrs = await hre.ethers.getSigners();
    owner = addrs[0];
    const MockErc20Factory = await hre.ethers.getContractFactory("MockErc20");
    MockErc20 = await MockErc20Factory.deploy("Mock Token", "MTK");
    const NeoTokyoPunksUtopiaFactory = await hre.ethers.getContractFactory(
      "NeoTokyoPunksUtopia"
    );
    NeoTokyoPunksUtopia = await NeoTokyoPunksUtopiaFactory.deploy(
      await MockErc20.getAddress(),
      startTime,
      ETH_PRICES,
      ASTAR_PRICES,
      [4500, 3500, 3000],
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e?"
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      0,
      [
        await addrs[1].getAddress(),
        await addrs[2].getAddress(),
        await addrs[3].getAddress(),
      ],
      [4500, 5, 10]
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      2,
      [
        await addrs[4].getAddress(),
        await addrs[5].getAddress(),
        await addrs[6].getAddress(),
      ],
      [3500, 5, 10]
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      3,
      [
        await addrs[7].getAddress(),
        await addrs[8].getAddress(),
        await addrs[9].getAddress(),
      ],
      [3000, 5, 10]
    );
  });

  it("Should deploy the contract", async function () {
    expect(await NeoTokyoPunksUtopia.name()).to.equal("NEO TOKYO PUNKS Utopia");
    expect(await NeoTokyoPunksUtopia.symbol()).to.equal("NTP Utopia");
  });

  it("Should not mintable before start time", async function () {
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[0] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 1-1, it should revert if not whitelisted", async function () {
    await increaseTo(startTime[0]);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[0] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 1-1, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 45; i++) {
      await NeoTokyoPunksUtopia.connect(addrs[1]).mint(100, {
        value: ETH_PRICES[0] * 100n,
      });
    }
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await addrs[1].getAddress())
    ).to.equal(4500n);
  });
  it("During WL 1-1, it should not allow minting if exceed stage limit", async function () {
    for (let i = 0; i < 45; i++) {
      await NeoTokyoPunksUtopia.connect(addrs[1]).mint(100, {
        value: ETH_PRICES[0] * 100n,
      });
    }
    await expect(
      NeoTokyoPunksUtopia.connect(addrs[2]).mint(2, {
        value: ETH_PRICES[0] * 2n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 1-2, it should revert if not whitelisted", async function () {
    await increaseTo(startTime[1]);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[0] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 1-2, it should allow up to 10 mints in single transaction and no limit for a wallet", async function () {
    // should success
    await NeoTokyoPunksUtopia.connect(addrs[2]).mint(6, {
      value: ETH_PRICES[0] * 6n,
    });
    await expect(
      NeoTokyoPunksUtopia.connect(addrs[2]).mint(11, {
        value: ETH_PRICES[0] * 11n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");

    // even if the wallet has remaining mintable amount for WL 1-1
    await expect(
      NeoTokyoPunksUtopia.connect(addrs[1]).mint(11, {
        value: ETH_PRICES[0] * 11n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 2, it should revert if not whitelisted", async function () {
    await increaseTo(startTime[2]);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[1] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 2, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 35; i++) {
      await NeoTokyoPunksUtopia.connect(addrs[4]).mint(100, {
        value: ETH_PRICES[1] * 100n,
      });
    }
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await addrs[4].getAddress())
    ).to.equal(3500n);
  });
  it("During WL 2, it should not allow minting if exceed stage limit", async function () {
    for (let i = 0; i < 35; i++) {
      await NeoTokyoPunksUtopia.connect(addrs[4]).mint(100, {
        value: ETH_PRICES[1] * 100n,
      });
    }
    await expect(
      NeoTokyoPunksUtopia.connect(addrs[5]).mint(2, {
        value: ETH_PRICES[1] * 2n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 3, it should revert if not whitelisted", async function () {
    await increaseTo(startTime[3]);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[2] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 3, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 30; i++) {
      await NeoTokyoPunksUtopia.connect(addrs[7]).mint(100, {
        value: ETH_PRICES[2] * 100n,
      });
    }
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await addrs[7].getAddress())
    ).to.equal(3000n);
  });
  it("During WL 3, it should not allow minting if exceed stage limit", async function () {
    for (let i = 0; i < 30; i++) {
      await NeoTokyoPunksUtopia.connect(addrs[7]).mint(100, {
        value: ETH_PRICES[2] * 100n,
      });
    }
    await expect(
      NeoTokyoPunksUtopia.connect(addrs[8]).mint(2, {
        value: ETH_PRICES[2] * 2n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During public sale, it should allow up to 10 mints in single transaction and no limit for a wallet", async function () {
    await increaseTo(startTime[4]);
    await NeoTokyoPunksUtopia.mint(6, {
      value: ETH_PRICES[3] * 6n,
    });
    await expect(
      NeoTokyoPunksUtopia.mint(11, {
        value: ETH_PRICES[3] * 11n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("Can pay with Astar", async function () {
    await MockErc20.mint(await addrs[1].getAddress(), ASTAR_PRICES[3]);
    await MockErc20.connect(addrs[1]).approve(
      await NeoTokyoPunksUtopia.getAddress(),
      ASTAR_PRICES[3]
    );
    await NeoTokyoPunksUtopia.connect(addrs[1]).mint(1);
    await expect(NeoTokyoPunksUtopia.mint(1)).to.be.revertedWith(
      "NEO TOKYO PUNKS Utopia: InsufficientAstarBalance"
    );
  });
});
