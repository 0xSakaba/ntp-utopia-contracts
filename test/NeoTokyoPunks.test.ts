import * as helper from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {
  concat,
  getBytes,
  keccak256,
  parseEther,
  Signer,
  toUtf8Bytes,
} from "ethers";
import hre from "hardhat";
import { MockErc20, NeoTokyoPunksUtopia } from "../typechain-types";

const { increaseTo } = helper.time;

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
];

describe("NeoTokyoPunksUtopia", function () {
  let NeoTokyoPunksUtopia: NeoTokyoPunksUtopia;
  let MockErc20: MockErc20;
  let whitelisted1: Signer;
  let whitelisted2: Signer;
  let notWhitelisted: Signer;
  const wl0 = new Date("2025-04-11T08:00:00Z").getTime() / 1000;
  const gap0 = new Date("2025-04-11T10:00:00Z").getTime() / 1000;
  const wl1_1 = new Date("2025-04-11T11:00:00Z").getTime() / 1000;
  const wl1_2 = new Date("2025-04-11T13:00:00Z").getTime() / 1000;
  const wl2 = new Date("2025-04-11T14:00:00Z").getTime() / 1000;
  const gap = new Date("2025-04-11T16:00:00Z").getTime() / 1000;
  const wl3 = new Date("2025-04-12T11:00:00Z").getTime() / 1000;
  const publicSale = new Date("2025-04-12T13:00:00Z").getTime() / 1000;

  beforeEach(async function () {
    const startTime = [wl0, gap0, wl1_1, wl1_2, wl2, gap, wl3, publicSale];

    [notWhitelisted, whitelisted1, whitelisted2] =
      await hre.ethers.getSigners();
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
      [3750, 4500, 3500, 3000],
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e?"
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      0,
      [await whitelisted1.getAddress(), await whitelisted2.getAddress()],
      [3750, 5]
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      1,
      [await whitelisted1.getAddress(), await whitelisted2.getAddress()],
      [4500, 5]
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      2,
      [await whitelisted1.getAddress(), await whitelisted2.getAddress()],
      [3500, 5]
    );
    await NeoTokyoPunksUtopia.batchUpdateWhitelist(
      3,
      [await whitelisted1.getAddress(), await whitelisted2.getAddress()],
      [3000, 5]
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

  it("During WL 0, it should revert if not whitelisted", async function () {
    await increaseTo(wl0);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[0] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 0, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 37; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100);
    }
    await NeoTokyoPunksUtopia.connect(whitelisted1).mint(50);
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await whitelisted1.getAddress())
    ).to.equal(3750n);
  });

  it("During WL 1-1, it should revert if not whitelisted", async function () {
    await increaseTo(wl1_1);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[0] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 1-1, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 45; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100, {
        value: ETH_PRICES[0] * 100n,
      });
    }
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await whitelisted1.getAddress())
    ).to.equal(4500n);
  });
  it("During WL 1-1, it should not allow minting if exceed stage limit", async function () {
    for (let i = 0; i < 45; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100, {
        value: ETH_PRICES[0] * 100n,
      });
    }
    await expect(
      NeoTokyoPunksUtopia.connect(whitelisted2).mint(2, {
        value: ETH_PRICES[0] * 2n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 1-2, it should revert if not whitelisted", async function () {
    await increaseTo(wl1_2);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[0] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 1-2, it should allow up to 10 mints in single transaction and no limit for a wallet", async function () {
    // should success
    await NeoTokyoPunksUtopia.connect(whitelisted2).mint(6, {
      value: ETH_PRICES[0] * 6n,
    });
    await expect(
      NeoTokyoPunksUtopia.connect(whitelisted2).mint(11, {
        value: ETH_PRICES[0] * 11n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");

    // even if the wallet has remaining mintable amount for WL 1-1
    await expect(
      NeoTokyoPunksUtopia.connect(whitelisted1).mint(11, {
        value: ETH_PRICES[0] * 11n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 2, it should revert if not whitelisted", async function () {
    await increaseTo(wl2);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[1] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 2, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 35; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100, {
        value: ETH_PRICES[1] * 100n,
      });
    }
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await whitelisted1.getAddress())
    ).to.equal(3500n);
  });
  it("During WL 2, it should not allow minting if exceed stage limit", async function () {
    for (let i = 0; i < 35; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100, {
        value: ETH_PRICES[1] * 100n,
      });
    }
    await expect(
      NeoTokyoPunksUtopia.connect(whitelisted2).mint(2, {
        value: ETH_PRICES[1] * 2n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During gap, it should revert", async function () {
    await increaseTo(gap);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[2] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During WL 3, it should revert if not whitelisted", async function () {
    await increaseTo(wl3);
    await expect(
      NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[3] })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });
  it("During WL 3, it should allow any amount of minting if not exceed its limit", async function () {
    for (let i = 0; i < 30; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100, {
        value: ETH_PRICES[2] * 100n,
      });
    }
    expect(
      await NeoTokyoPunksUtopia.balanceOf(await whitelisted1.getAddress())
    ).to.equal(3000n);
  });
  it("During WL 3, it should not allow minting if exceed stage limit", async function () {
    for (let i = 0; i < 30; i++) {
      await NeoTokyoPunksUtopia.connect(whitelisted1).mint(100, {
        value: ETH_PRICES[2] * 100n,
      });
    }
    await expect(
      NeoTokyoPunksUtopia.connect(whitelisted2).mint(2, {
        value: ETH_PRICES[2] * 2n,
      })
    ).to.be.revertedWith("NEO TOKYO PUNKS Utopia: ExceedsMintable");
  });

  it("During public sale, it should allow up to 10 mints in single transaction and no limit for a wallet", async function () {
    await increaseTo(publicSale);
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
    await MockErc20.mint(await whitelisted1.getAddress(), ASTAR_PRICES[3]);
    await MockErc20.connect(whitelisted1).approve(
      await NeoTokyoPunksUtopia.getAddress(),
      ASTAR_PRICES[3]
    );
    await NeoTokyoPunksUtopia.connect(whitelisted1).mint(1);
    await expect(NeoTokyoPunksUtopia.mint(1)).to.be.revertedWith(
      "NEO TOKYO PUNKS Utopia: InsufficientAstarBalance"
    );
  });

  it("Admin can mint", async function () {
    await NeoTokyoPunksUtopia.grantRole(
      await NeoTokyoPunksUtopia.MINTER_ROLE(),
      await notWhitelisted.getAddress()
    );
    await NeoTokyoPunksUtopia.adminMint(await notWhitelisted.getAddress(), 1);
  });

  it("Should show correct token URI", async function () {
    const copyrightUri = "https://example.com/copyright";
    const copyrightHash = keccak256(toUtf8Bytes("Test"));
    await NeoTokyoPunksUtopia.setCopyrightLicense(copyrightUri, copyrightHash);

    // it should be signed when minted
    await NeoTokyoPunksUtopia.mint(1, { value: ETH_PRICES[3] });
    expect(await NeoTokyoPunksUtopia.tokenURI(1)).to.equal(
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e?1-signed.json"
    );

    // after transfer, the token should be unsigned
    await NeoTokyoPunksUtopia.transferFrom(
      await notWhitelisted.getAddress(),
      await whitelisted1.getAddress(),
      1
    );
    expect(await NeoTokyoPunksUtopia.tokenURI(1)).to.equal(
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e?1-unsigned.json"
    );

    // after reveal
    await NeoTokyoPunksUtopia.setBaseURI(
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e/"
    );
    expect(await NeoTokyoPunksUtopia.tokenURI(1)).to.equal(
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e/1-unsigned.json"
    );

    // after sign
    const signature = await whitelisted1.signMessage(getBytes(copyrightHash));
    await NeoTokyoPunksUtopia.connect(whitelisted1).acceptLicenseForTokens(
      [1],
      signature
    );
    expect(await NeoTokyoPunksUtopia.tokenURI(1)).to.equal(
      "ipfs://bafybeicgnjzhjf5m25qtwhvrq434mngbwnzdb3v5ki75ttgylpvqtjbe4e/1-signed.json"
    );
  });
});
