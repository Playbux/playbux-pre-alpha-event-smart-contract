import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deploy } from '../utils';
import { buildTransaction, getParameters } from '../utils/buildTransaction';
import { fastForwardBlock } from '../utils/evm';

const {
  utils: { parseEther },
  constants: { HashZero },
  Wallet,
} = ethers;

describe('BUSDFactory', async function () {
  // Deploy contracts
  before(async function () {
    [this.owner, this.admin, this.userA, this.userB] = await ethers.getSigners();

    // private key of await (ethers.getSigner())[1] of hardhat node
    this.adminWallet = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
    this.fakeAdmin = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603000000000');
  });

  beforeEach(async function () {
    this.MockBUSD = await deploy('MockBUSD');
    this.BUSDFactory = await deploy('BUSDFactory', [this.MockBUSD.address, this.admin.address]);
    await this.MockBUSD.transfer(this.BUSDFactory.address, parseEther('1000000'));
    await this.BUSDFactory.unpause();
  });

  describe('Owner', async function () {
    it('should have correct owner', async function () {
      expect(await this.BUSDFactory.hasRole(HashZero, this.owner.address)).to.equal(true);
    });
  });

  describe('Pausable', async function () {
    it('should be paused', async function () {
      await this.BUSDFactory.pause();
      expect(await this.BUSDFactory.paused()).to.equal(true);
    });

    it('should be unpaused', async function () {
      await this.BUSDFactory.pause();
      await this.BUSDFactory.unpause();
      expect(await this.BUSDFactory.paused()).to.equal(false);
    });

    it('should not be able to withdraw when paused', async function () {
      await this.BUSDFactory.pause();
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to withdraw when unpaused', async function () {
      await this.BUSDFactory.pause();
      await this.BUSDFactory.unpause();
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });
  });

  describe('setWithdrawalLimitPerDay', async function () {
    it('should be able to set withdraw limit per day', async function () {
      await this.BUSDFactory.setWithdrawalLimitPerDay(100);
      expect(await this.BUSDFactory.withdrawalLimitPerDay()).to.equal(100);
    });

    it('should not be able to set withdraw limit per day if not owner', async function () {
      await expect(this.BUSDFactory.connect(this.userA).setWithdrawalLimitPerDay(100)).to.be.reverted;
    });
  });

  describe('setAdmin', async function () {
    it('should be able to set admin', async function () {
      await this.BUSDFactory.setAdmin(this.userA.address);
      expect(await this.BUSDFactory.admin()).to.equal(this.userA.address);
    });

    it('should not be able to set admin if not owner', async function () {
      await expect(this.BUSDFactory.connect(this.userA).setAdmin(this.userA.address)).to.be.reverted;
    });
  });

  describe('emergencyWithdraw', async function () {
    it('should be able to emergency withdraw by owner', async function () {
      const contractBalance = await this.MockBUSD.balanceOf(this.BUSDFactory.address);
      const oldOwnerBalance = await this.MockBUSD.balanceOf(this.owner.address);
      await this.BUSDFactory.emergencyWithdraw(this.MockBUSD.address);
      const newOwnerBalance = await this.MockBUSD.balanceOf(this.owner.address);
      expect(newOwnerBalance.sub(oldOwnerBalance)).to.equal(contractBalance);
    });

    it('should not be able to emergency withdraw by non-owner', async function () {
      await expect(this.BUSDFactory.connect(this.userA).emergencyWithdraw(this.MockBUSD.address)).to.be.reverted;
    });
  });

  describe('withdraw', async function () {
    it('should be able to withdraw', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });

    it('should not be able to withdraw if not admin', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 1],
        this.fakeAdmin,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userB).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to withdraw many nfts', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 10],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });

    it('should not be able to withdraw more than withdraw limit per day', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, parseEther('6000')],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should not be able to withdraw if expired', async function () {
      const { transactionId } = await getParameters();
      const expirationBlock = 0;
      const args = [transactionId, expirationBlock, this.userA.address, 1];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        args,
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to withdraw several types', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
      const {
        r: r2,
        s: s2,
        v: v2,
        functionSignature: functionSignature2,
      } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature2, r2, s2, v2)
      ).to.not.be.reverted;
    });

    it('should be able to withdraw if passed the day', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId, expirationBlock, this.userA.address, parseEther('100')],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.not.reverted;

      const { transactionId: transactionId2, expirationBlock: expirationBlock2 } = await getParameters();
      const {
        r: r2,
        s: s2,
        v: v2,
        functionSignature: functionSignature2,
      } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId2, expirationBlock2, this.userA.address, parseEther('6000')],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature2, r2, s2, v2)
      ).to.be.reverted;

      await fastForwardBlock(86400);
      const { transactionId: transactionId3, expirationBlock: expirationBlock3 } = await getParameters();
      const {
        r: r3,
        s: s3,
        v: v3,
        functionSignature: functionSignature3,
      } = await buildTransaction(
        this.BUSDFactory,
        'withdraw',
        [transactionId3, expirationBlock3, this.userA.address, parseEther('5000')],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.BUSDFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature3, r3, s3, v3)
      ).to.not.be.reverted;
    });
  });
});
