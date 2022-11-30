import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deploy } from '../utils';

const {
  utils: { parseEther, id },
  constants: { MaxUint256, HashZero, AddressZero },
} = ethers;

const FACTORY_ROLE = id('FACTORY_ROLE');

describe('PlaybuxSBTFactory', async function () {
  // Deploy contracts
  before(async function () {
    [this.owner, this.admin, this.userA, this.userB] = await ethers.getSigners();
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

  describe('Mint', async function () {
    it('should not be able to mint if insufficient balance', async function () {
      const balance = await this.MockBUSD.balanceOf(this.userA.address);
      await this.MockBUSD.connect(this.userA).transfer(this.userB.address, balance); // transfer all of userA's BUSD to userB
      await expect(this.PlaybuxSBTFactory.connect(this.userA).mint('1')).to.be.revertedWith(
        'Insufficient BUSD balance'
      );
    });

    it('should not be able to mint if not approved', async function () {
      await expect(this.PlaybuxSBTFactory.mint('1')).to.be.revertedWith('ERC20: insufficient allowance');
    });

    it('should not be able to mint if already minted', async function () {
      await this.PlaybuxSBTFactory.connect(this.userA).mint('1');
      await expect(this.PlaybuxSBTFactory.connect(this.userA).mint('1')).to.be.revertedWith(
        'Owner already has token of this type'
      );
    });
  });

  describe('setSBTPriceByType', async function () {
    it('should be able to set SBT price', async function () {
      await this.PlaybuxSBTFactory.setSBTPriceByType(1, parseEther('1'));
      expect(await this.PlaybuxSBTFactory.SBTPriceByType(1)).to.equal(parseEther('1'));
    });

    it('should not be able to set SBT price if not admin', async function () {
      await expect(this.PlaybuxSBTFactory.connect(this.userA).setSBTPriceByType(1, parseEther('1'))).to.be.reverted;
    });

    it('should not be able to set SBT price of type zero', async function () {
      await expect(this.PlaybuxSBTFactory.setSBTPriceByType(0, parseEther('1'))).to.be.revertedWith(
        'SBT type must be greater than 0'
      );
    });

    it('should not be able to set SBT price to zero', async function () {
      await expect(this.PlaybuxSBTFactory.setSBTPriceByType(1, 0)).to.be.revertedWith(
        'SBT price must be greater than 0'
      );
    });

    it('should use new price after set new price', async function () {
      await this.PlaybuxSBTFactory.setSBTPriceByType(1, parseEther('1'));
      const balanceA = await this.MockBUSD.balanceOf(this.userA.address);
      await this.PlaybuxSBTFactory.connect(this.userA).mint('1');
      expect(await this.MockBUSD.balanceOf(this.userA.address)).to.equal(balanceA.sub(parseEther('1')));
    });
  });

  describe('setOpenToSaleByType', async function () {
    it('should be able to set open to sale', async function () {
      await this.PlaybuxSBTFactory.setOpenToSaleByType(1, true);
      expect(await this.PlaybuxSBTFactory.openToSaleByType(1)).to.equal(true);
    });

    it('should not be able to set open to sale if not admin', async function () {
      await expect(this.PlaybuxSBTFactory.connect(this.userA).setOpenToSaleByType(1, true)).to.be.reverted;
    });

    it('should not be able to set open to type zero', async function () {
      await expect(this.PlaybuxSBTFactory.setOpenToSaleByType(0, true)).to.be.revertedWith(
        'SBT type must be greater than 0'
      );
    });

    it('should be able to mint if open to sale is set to false', async function () {
      await this.PlaybuxSBTFactory.setOpenToSaleByType(1, false);
      await expect(this.PlaybuxSBTFactory.connect(this.userA).mint('1')).to.be.revertedWith(
        'SBT type is not open to sale'
      );
    });
  });
});
