import { expect } from "chai";
import hre from "hardhat";
import { Signer } from "ethers";
import { SolarNFT } from "../typechain-types";

describe("SolarNFT", function () {
  let SolarNFT: SolarNFT;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const SolarNFTFactory = await hre.ethers.getContractFactory("SolarNFT");
    SolarNFT = await SolarNFTFactory.deploy("https://example.com/");

    await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24]); // Increase time by 1 day
    await hre.ethers.provider.send("evm_mine", []);
  });

  it("Should deploy the contract", async function () {
    expect(await SolarNFT.name()).to.equal("ROHKI - SOLAR");
    expect(await SolarNFT.symbol()).to.equal("SOLAR");
  });

  it("Should mint NFTs within the sale period", async function () {
    await SolarNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.000777"),
    });
    expect(await SolarNFT.totalSupply()).to.equal(1);
  });

  it("Should not mint NFTs exceeding the maximum supply", async function () {
    await expect(
      SolarNFT.connect(addr1).mint(1000000, {
        value: hre.ethers.parseEther("777"),
      })
    ).to.be.revertedWith("Exceeds MAX_SUPPLY");
  });

  it("Should not mint NFTs with insufficient ETH", async function () {
    await expect(
      SolarNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.0001"),
      })
    ).to.be.revertedWith("Insufficient ETH sent");
  });

  it("Should allow the owner to set the base URI", async function () {
    await SolarNFT.connect(owner).setBaseURI("https://newexample.com/");

    await SolarNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.000777"),
    });
    expect(await SolarNFT.tokenURI(1)).to.equal("https://newexample.com/");
  });

  it("Should allow the owner to withdraw the contract balance", async function () {
    await SolarNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.000777"),
    });
    const initialBalance = await hre.ethers.provider.getBalance(
      await owner.getAddress()
    );
    await SolarNFT.connect(owner).withdraw();
    const finalBalance = await hre.ethers.provider.getBalance(
      await owner.getAddress()
    );
    expect(finalBalance).to.be.above(initialBalance);
  });

  it("Should not mint NFTs after the sale period", async function () {
    await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // Set time to 31 days
    await hre.ethers.provider.send("evm_mine", []);

    await expect(
      SolarNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.000777"),
      })
    ).to.be.revertedWith("Sale has ended");
  });
});
