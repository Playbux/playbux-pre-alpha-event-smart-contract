import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deploy } from '../utils';

const {
  utils: { parseEther, id, hexlify, Interface, randomBytes },
  constants: { MaxUint256, HashZero, AddressZero },
  Wallet,
} = ethers;

const FACTORY_ROLE = id('FACTORY_ROLE');

describe('PlaybuxSBTFactory', async function () {
  // Deploy contracts
  before(async function () {
    [this.owner, this.admin, this.userA, this.userB] = await ethers.getSigners();

    // private key of await (ethers.getSigner())[1] of hardhat node
    this.adminWallet = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
    this.fakeAdmin = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603000000000');
  });

  beforeEach(async function () {
    this.MockBUSD = await deploy('MockBUSD');
    this.PlaybuxSBT = await deploy('PlaybuxSBT', ['ipfs://QmcKPyF2iwudk9wEyXeBJFNLQNvmTjoR4trELFZzbuv9sU/']);
    this.PlaybuxSBTFactory = await deploy('PlaybuxSBTFactory', [this.MockBUSD.address, this.PlaybuxSBT.address]);
    await this.MockBUSD.transfer(this.userA.address, parseEther('1000000'));
    await this.MockBUSD.connect(this.userA).approve(this.PlaybuxSBTFactory.address, MaxUint256);
    await this.PlaybuxSBT.grantRole(FACTORY_ROLE, this.PlaybuxSBTFactory.address);
    await this.PlaybuxSBTFactory.unpause();
  });

  describe('Owner', async function () {
    it('should have correct owner', async function () {
      expect(await this.PlaybuxSBTFactory.hasRole(HashZero, this.owner.address)).to.equal(true);
    });
  });

  describe('Pausable', async function () {
    it('should be paused', async function () {
      await this.PlaybuxSBTFactory.pause();
      expect(await this.PlaybuxSBTFactory.paused()).to.equal(true);
    });

    it('should be unpaused', async function () {
      await this.PlaybuxSBTFactory.pause();
      await this.PlaybuxSBTFactory.unpause();
      expect(await this.PlaybuxSBTFactory.paused()).to.equal(false);
    });

    it('should not be able to mint when paused', async function () {
      await this.PlaybuxSBTFactory.pause();
      await expect(this.PlaybuxSBTFactory.mint('1')).to.be.revertedWith('Pausable: paused');
    });

    it('should be able to mint when unpaused', async function () {
      await this.PlaybuxSBTFactory.pause();
      await this.PlaybuxSBTFactory.unpause();
      await this.PlaybuxSBTFactory.connect(this.userA).mint('1');
      expect(await this.PlaybuxSBT.balanceOf(this.userA.address)).to.equal('1');
    });
  });

  describe('setAdmin', async function () {
    it('should be able to set admin', async function () {
      await this.PlaybuxSBTFactory.grantRole(HashZero, this.userB.address);
      expect(await this.PlaybuxSBTFactory.hasRole(HashZero, this.userB.address)).to.equal(true);
    });
    it('should not be able to set admin if not owner', async function () {
      await expect(this.PlaybuxSBTFactory.connect(this.userA).grantRole(HashZero, this.userA.address)).to.be.reverted;
    });
  });

  describe('withdraw', async function () {
    beforeEach(async function () {
      await this.MockBUSD.transfer(this.PlaybuxSBTFactory.address, parseEther('1000000'));
    });
    it('should be able to withdraw', async function () {
      await this.PlaybuxSBTFactory.withdraw(this.MockBUSD.address);
      expect(await this.MockBUSD.balanceOf(this.PlaybuxSBTFactory.address)).to.equal('0');
    });
    it('should not be able to withdraw if not admin', async function () {
      await expect(this.PlaybuxSBTFactory.connect(this.userA).withdraw(this.MockBUSD.address)).to.be.reverted;
    });
  });
});
