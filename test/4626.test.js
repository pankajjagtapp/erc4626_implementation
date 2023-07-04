const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC4626 Contract", function () {
  let owner;
  let addr1;
  let erc20;
  let vault;

  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("MyToken");
    erc20 = await ERC20.deploy(addr1.address);
    await erc20.deployed();

    const ERC4626 = await ethers.getContractFactory("ERC4626");
    vault = await ERC4626.deploy(erc20.address, "JagtapCoin", "JAGGU");
    await vault.deployed();
  });

  describe("Deployment", async () => {
    it("should return correct name", async () => {
      expect(await erc20.name()).to.be.equal("Jagtap Coin");
    });

    it("should return correct symbol", async () => {
      expect(await erc20.symbol()).to.be.equal("JAGGU");
    });

    it("should return totalAssets", async () => {
      expect(await vault.totalAssets()).to.equal(0);
    });
  });

  describe("Deposit Function", async () => {
    beforeEach(async () => {
      approved = await erc20.connect(addr1).approve(vault.address, 1000);
      deposit = await vault.connect(addr1).deposit(100, addr1.address);
    });

    it("should not allow 0 deposit tokens", async () => {
      await expect(
        vault.connect(addr1).deposit(0, addr1.address)
      ).to.be.revertedWith("ZERO_SHARES");
    });

    it("should deposit tokens", async () => {
      const currentBal = await erc20.balanceOf(addr1.address);
      const vaultBal = await erc20.balanceOf(vault.address);
      await expect(currentBal).to.equal(9900);
      await expect(vaultBal).to.equal(100);
    });

    it("should check updated mappings", async () => {
      const temp = await vault.addressToUser(addr1.address);
      const _assets = await temp.assets;
      await expect(_assets).to.equal(100);
    });

    it("should emit Deposit Event", async () => {
      const shares = await vault.previewDeposit(100);
      expect()
        .to.emit(vault, "Deposit")
        .withArgs(addr1.address, addr1.address, 100, shares);
    });
  });

  describe("Mint Function", async () => {
    beforeEach(async () => {
      approved = await erc20.connect(addr1).approve(vault.address, 1000);
      deposit = await vault.connect(addr1).mint(100, addr1.address);
    });

    it("should mint shares for assets", async () => {
      const currentBal = await erc20.balanceOf(addr1.address);
      const vaultBal = await erc20.balanceOf(vault.address);
      await expect(currentBal).to.equal(9900);
      await expect(vaultBal).to.equal(100);
    });

    it("should not allow for 0 shares to be minted", async () => {
      await expect(
        vault.connect(addr1).mint(0, addr1.address)
      ).to.be.revertedWith("ZERO_SHARES");
    });

    it("should emit DepositViaMint Event", async () => {
      const assets = await vault.previewMint(100);
      expect()
        .to.emit(vault, "DepositViaMint")
        .withArgs(addr1.address, addr1.address, 100, assets);
    });
  });

  describe("Withdraw Function", async () => {
    beforeEach(async () => {
      await erc20.connect(addr1).approve(vault.address, 1000);
      await vault.connect(addr1).deposit(100, addr1.address);
      await vault.connect(addr1).withdraw(50, addr1.address, addr1.address);
    });

    it("should withdraw tokens", async () => {
      const currentBal = await erc20.balanceOf(addr1.address);
      expect(currentBal).to.be.equal(9950);
    });

    it("should emit Withdraw Event", async () => {
      const shares = await vault.previewWithdraw(100);
      expect()
        .to.emit(vault, "Withdraw")
        .withArgs(addr1.address, addr1.address, addr1.address, 50, shares);
    });
  });

  describe("Redeem Function", async () => {
    beforeEach(async () => {
      await erc20.connect(addr1).approve(vault.address, 1000);
      await vault.connect(addr1).deposit(100, addr1.address);
      await vault.connect(addr1).redeem(50, addr1.address, addr1.address);
    });

    it("should redeem shares for assets", async () => {
      const currentBal = await erc20.balanceOf(addr1.address);
      expect(currentBal).to.be.equal(9950);
    });

    it("should not allow for 0 shares to be redeemed", async () => {
      await expect(
        vault.connect(addr1).redeem(0, addr1.address, addr1.address)
      ).to.be.revertedWith("ZERO_ASSETS");
    });

    it("should emit Redeemed Event", async () => {
      const shares = await vault.previewRedeem(100);
      expect()
        .to.emit(vault, "Redeemed")
        .withArgs(addr1.address, addr1.address, addr1.address, 50, shares);
    });
  });

  describe("View Functions", async () => {
    beforeEach(async () => {
      await erc20.connect(addr1).approve(vault.address, 1000);
      await vault.connect(addr1).deposit(100, addr1.address);
      await vault.connect(addr1).redeem(50, addr1.address, addr1.address);
    });

    it("should operate convertToShares Function", async () => {
      const shares = await vault.connect(addr1).convertToShares(100);
      expect(shares).to.be.equal(100);
    });

    it("should operate convertToAssets Function", async () => {
      const shares = await vault.connect(addr1).convertToAssets(100);
      expect(shares).to.be.equal(100);
    });

    it("should operate previewDeposit Function", async () => {
      const shares = await vault.connect(addr1).previewDeposit(100);
      expect(shares).to.be.equal(100);
    });

    it("should operate previewMint Function", async () => {
      const shares = await vault.connect(addr1).previewMint(100);
      expect(shares).to.be.equal(100);
    });

    it("should operate previewWithdraw Function", async () => {
      const shares = await vault.connect(addr1).previewWithdraw(100);
      expect(shares).to.be.equal(100);
    });

    it("should operate previewRedeem Function", async () => {
      const shares = await vault.connect(addr1).previewRedeem(100);
      expect(shares).to.be.equal(100);
    });

    it("should operate maxDeposit Function", async () => {
      const shares = parseInt(
        await vault.connect(addr1).maxDeposit(addr1.address)
      );
      const exp_val = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
      expect(shares).to.be.equal(exp_val);
    });

    it("should operate maxMint Function", async () => {
      const shares = parseInt(
        await vault.connect(addr1).maxMint(addr1.address)
      );
      const exp_val = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
      expect(shares).to.be.equal(exp_val);
    });

    it("should operate maxWithdraw Function", async () => {
      const shares = parseInt(
        await vault.connect(addr1).maxWithdraw(addr1.address)
      );
      expect(shares).to.be.equal(50);
    });

    it("should operate maxRedeem Function", async () => {
      const shares = parseInt(
        await vault.connect(addr1).maxRedeem(addr1.address)
      );
      expect(shares).to.be.equal(50);
    });
  });
});
