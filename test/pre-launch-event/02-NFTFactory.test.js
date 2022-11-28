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

describe('NFTFactory', async function () {
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
    this.NFTFactory = await deploy('NFTFactory', [this.PlaybuxQuestNFT.address, this.admin.address]);
    await this.PlaybuxQuestNFT.grantRole(FACTORY_ROLE, this.NFTFactory.address);
    await this.NFTFactory.unpause();
  });

  describe('Owner', async function () {
    it('should have correct owner', async function () {
      expect(await this.NFTFactory.hasRole(HashZero, this.owner.address)).to.equal(true);
    });
  });

  describe('Pausable', async function () {
    it('should be paused', async function () {
      await this.NFTFactory.pause();
      expect(await this.NFTFactory.paused()).to.equal(true);
    });

    it('should be unpaused', async function () {
      await this.NFTFactory.pause();
      await this.NFTFactory.unpause();
      expect(await this.NFTFactory.paused()).to.equal(false);
    });

    it('should not be able to mint when paused', async function () {
      await this.NFTFactory.pause();
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to mint when unpaused', async function () {
      await this.NFTFactory.pause();
      await this.NFTFactory.unpause();
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });
  });

  describe('setMintLimitPerDay', async function () {
    it('should be able to set mint limit per day', async function () {
      await this.NFTFactory.setMintLimitPerDay(100);
      expect(await this.NFTFactory.mintLimitPerDay()).to.equal(100);
    });

    it('should not be able to set mint limit per day if not owner', async function () {
      await expect(this.NFTFactory.connect(this.userA).setMintLimitPerDay(100)).to.be.reverted;
    });
  });

  describe('setAdmin', async function () {
    it('should be able to set admin', async function () {
      await this.NFTFactory.setAdmin(this.userA.address);
      expect(await this.NFTFactory.admin()).to.equal(this.userA.address);
    });

    it('should not be able to set admin if not owner', async function () {
      await expect(this.NFTFactory.connect(this.userA).setAdmin(this.userA.address)).to.be.reverted;
    });
  });

  describe('mint', async function () {
    it('should be able to mint', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });

    it('should not be able to mint if not admin', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 1],
        this.fakeAdmin,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userB).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to mint many nfts', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 10, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
    });

    it('should not be able to mint more than mint limit per day', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 100, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should not be able to mint if expired', async function () {
      const { transactionId } = await getParameters();
      const expirationBlock = 0;
      const args = [transactionId, expirationBlock, this.userA.address, 1, 1];
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        args,
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to mint several types', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.not.be.reverted;
      const {
        r: r2,
        s: s2,
        v: v2,
        functionSignature: functionSignature2,
      } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 2],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature2, r2, s2, v2)
      ).to.not.be.reverted;
    });

    it('should not be able to mint if revoke factory role', async function () {
      await this.PlaybuxQuestNFT.revokeRole(FACTORY_ROLE, this.NFTFactory.address);
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 1, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.reverted;
    });

    it('should be able to mint if passed the day', async function () {
      const { transactionId, expirationBlock } = await getParameters();
      const { r, s, v, functionSignature } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId, expirationBlock, this.userA.address, 10, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature, r, s, v)
      ).to.be.not.reverted;

      const { transactionId: transactionId2, expirationBlock: expirationBlock2 } = await getParameters();
      const {
        r: r2,
        s: s2,
        v: v2,
        functionSignature: functionSignature2,
      } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId2, expirationBlock2, this.userA.address, 1, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature2, r2, s2, v2)
      ).to.be.reverted;

      await fastForwardBlock(86400);
      const { transactionId: transactionId3, expirationBlock: expirationBlock3 } = await getParameters();
      const {
        r: r3,
        s: s3,
        v: v3,
        functionSignature: functionSignature3,
      } = await buildTransaction(
        this.NFTFactory,
        'mint',
        [transactionId3, expirationBlock3, this.userA.address, 10, 1],
        this.adminWallet,
        this.userA
      );
      await expect(
        this.NFTFactory.connect(this.userA).executeMetaTransaction(this.admin.address, functionSignature3, r3, s3, v3)
      ).to.not.be.reverted;
    });
  });
});
