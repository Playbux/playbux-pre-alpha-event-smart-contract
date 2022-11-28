import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deploy } from '../utils';
import { buildTransaction, getParameters } from '../utils/buildTransaction';
import { fastForwardBlock } from '../utils/evm';

const {
  utils: { id },
  constants: { HashZero },
  Wallet,
} = ethers;
const FACTORY_ROLE = id('FACTORY_ROLE');

describe('NFTCompound', async function () {
  // Deploy contracts
  before(async function () {
    [this.owner, this.admin, this.userA, this.userB] = await ethers.getSigners();

    // private key of await (ethers.getSigner())[1] of hardhat node
    this.adminWallet = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
    this.fakeAdmin = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603000000000');
  });

  beforeEach(async function () {
    this.PlaybuxQuestNFT = await deploy('PlaybuxQuestNFT', [
      this.owner.address,
      '500',
      'ipfs://QmZzTKnHGGALcpf5N7GoyQYDJ6ngS2gSopeEao8cfVJePf/',
    ]);
    this.NFTCompound = await deploy('NFTCompound', [this.PlaybuxQuestNFT.address, this.admin.address]);
    await this.PlaybuxQuestNFT.grantRole(FACTORY_ROLE, this.NFTCompound.address);
    await this.PlaybuxQuestNFT.grantRole(FACTORY_ROLE, this.owner.address); // for easier testing
    await this.NFTCompound.unpause();
    for (let i = 0; i < 10; i++) {
      await this.PlaybuxQuestNFT.mintTo(this.userA.address, '1');
    }

    expect(await this.PlaybuxQuestNFT.balanceOf(this.userA.address)).to.equal(10);

    // approve for burn
    await this.PlaybuxQuestNFT.connect(this.userA).setApprovalForAll(this.NFTCompound.address, true);
  });

  describe('Owner', async function () {
    it('should have correct owner', async function () {
      expect(await this.NFTCompound.hasRole(HashZero, this.owner.address)).to.equal(true);
    });
  });

  describe('Pausable', async function () {
    it('should be paused', async function () {
      await this.NFTCompound.pause();
      expect(await this.NFTCompound.paused()).to.equal(true);
    });

    it('should be unpaused', async function () {
      await this.NFTCompound.pause();
      await this.NFTCompound.unpause();
      expect(await this.NFTCompound.paused()).to.equal(false);
    });

    it('should not be able to compound when paused', async function () {
      await this.NFTCompound.pause();
      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['1000000000000000001', '1000000000000000002', '1000000000000000003'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 10, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to compound when unpaused', async function () {
      await this.NFTCompound.pause();
      await this.NFTCompound.unpause();
      const tokenIds = ['1000000000000000001', '1000000000000000002', '1000000000000000003'];
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 10, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });
  });

  describe('setCompoundLimitPerDay', async function () {
    it('should be able to set compound limit per day', async function () {
      await this.NFTCompound.setCompoundLimitPerDay(100);
      expect(await this.NFTCompound.compoundLimitPerDay()).to.equal(100);
    });

    it('should not be able to set compound limit per day if not owner', async function () {
      await expect(this.NFTCompound.connect(this.userA).setCompoundLimitPerDay(100)).to.be.reverted;
    });
  });

  describe('setAdmin', async function () {
    it('should be able to set admin', async function () {
      await this.NFTCompound.setAdmin(this.userA.address);
      expect(await this.NFTCompound.admin()).to.equal(this.userA.address);
    });

    it('should not be able to set admin if not owner', async function () {
      await expect(this.NFTCompound.connect(this.userA).setAdmin(this.userA.address)).to.be.reverted;
    });
  });

  describe('compound', async function () {
    it('should be able to compound', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['1000000000000000001', '1000000000000000002', '1000000000000000003'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 10, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });

    it('should not be able to compound if not admin', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['1000000000000000001', '1000000000000000002', '1000000000000000003'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 10, tokenIds],
        this.fakeAdmin,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userB).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should not be able to compound more than compound limit per day', async function () {
      for (let i = 1; i <= 11; i++) {
        await this.PlaybuxQuestNFT.mintTo(this.userA.address, i);
      }

      for (let i = 1; i <= 10; i++) {
        const { transactionId, expirationBlock } = await getParameters();
        const tokenIds = [i + '000000000000000001'];
        const { r, s, v, functionSignature } = await buildTransaction(
          this.NFTCompound,
          'compound',
          [transactionId, expirationBlock, this.userA.address, 100, tokenIds],
          this.adminWallet,
          this.userA
        );
        await expect(
          this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
        ).to.be.not.reverted;
      }

      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['11000000000000000001'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 100, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should not be able to compound if expired', async function () {
      const { transactionId } = await getParameters();
      const tokenIds = ['1000000000000000001', '1000000000000000002', '1000000000000000003'];
      const expirationBlock = 0;
      const args = [transactionId, expirationBlock, this.userA.address, 10, tokenIds];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        args,
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to compound several types', async function () {
      for (let i = 1; i < 10; i++) {
        const { transactionId, expirationBlock } = await getParameters();
        const tokenIds = ['100000000000000000' + i];
        const { r, s, v, functionSignature } = await buildTransaction(
          this.NFTCompound,
          'compound',
          [transactionId, expirationBlock, this.userA.address, '100' + i, tokenIds],
          this.adminWallet,
          this.userA
        );
        await expect(
          this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
        ).to.be.not.reverted;
      }
    });

    it('should not be able to compound if revoke factory role', async function () {
      await this.PlaybuxQuestNFT.revokeRole(FACTORY_ROLE, this.NFTCompound.address);
      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['1000000000000000001', '1000000000000000002', '1000000000000000003'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 10, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to compound if passed the day', async function () {
      for (let i = 1; i <= 12; i++) {
        await this.PlaybuxQuestNFT.mintTo(this.userA.address, i);
      }

      for (let i = 1; i <= 10; i++) {
        const { transactionId, expirationBlock } = await getParameters();
        const tokenIds = [i + '000000000000000001'];
        const { r, s, v, functionSignature } = await buildTransaction(
          this.NFTCompound,
          'compound',
          [transactionId, expirationBlock, this.userA.address, 100, tokenIds],
          this.adminWallet,
          this.userA
        );
        await expect(
          this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
        ).to.be.not.reverted;
      }

      const { transactionId: transactionId2, expirationBlock: expirationBlock2 } = await getParameters();
      const tokenIds2 = ['11' + '000000000000000001'];
      const {
        r: r2,
        s: s2,
        v: v2,
        functionSignature: functionSignature2,
      } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId2, expirationBlock2, this.userA.address, 10, tokenIds2],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature2, r2, s2, v2)
      ).to.be.reverted;

      await fastForwardBlock(86400);
      const { transactionId: transactionId3, expirationBlock: expirationBlock3 } = await getParameters();
      const tokenIds3 = ['12' + '000000000000000001'];
      const {
        r: r3,
        s: s3,
        v: v3,
        functionSignature: functionSignature3,
      } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId3, expirationBlock3, this.userA.address, 10, tokenIds3],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature3, r3, s3, v3)
      ).to.be.not.reverted;
    });

    it('should be able to compound if user has enough token', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['5000000000000000001'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 100, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should not be able to compound if user has not approve to factory contract', async function () {
      await this.PlaybuxQuestNFT.connect(this.userA).setApprovalForAll(this.NFTCompound.address, false);
      const { transactionId, expirationBlock } = await getParameters();
      const tokenIds = ['1000000000000000001'];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTCompound,
        'compound',
        [transactionId, expirationBlock, this.userA.address, 100, tokenIds],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTCompound.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });
  });
});
