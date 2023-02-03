const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('../utils');

const {
  utils: { id },
} = ethers;

const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
const FACTORY_ROLE = id('FACTORY_ROLE');

const URI = 'ipfs://QmcKPyF2iwudk9wEyXeBJFNLQNvmTjoR4trELFZzbuv9sU/';

describe('PlaybuxSBT', async () => {
  // Contract
  let PlaybuxSBT;

  async function grantRole(address) {
    const tx = await PlaybuxSBT.grantRole(FACTORY_ROLE, address);
    await tx.wait();
  }

  beforeEach(async () => {
    // Deploy contract
    const [deployer, minter] = await ethers.getSigners();

    PlaybuxSBT = await deploy('PlaybuxSBT', [URI]);

    // grantRole
    await grantRole(minter.address);
    await grantRole(deployer.address);
  });

  describe('## mintTo method', async () => {
    it('should be get id correctly when mint with tokenType 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const expectedId = ethers.BigNumber.from(`1000000000000000001`);

      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1'))
        .to.emit(PlaybuxSBT, 'Transfer')
        .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
    });

    it('should be get id correctly when mint with tokenType 2', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const expectedId = ethers.BigNumber.from(`2000000000000000001`);

      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '2'))
        .to.emit(PlaybuxSBT, 'Transfer')
        .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
    });

    it('should be get id correctly when mint with tokenType 3', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const expectedId = ethers.BigNumber.from(`3000000000000000001`);

      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '3'))
        .to.emit(PlaybuxSBT, 'Transfer')
        .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
    });

    it('should be get id correctly when mint with tokenType 9', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const expectedId = ethers.BigNumber.from(`9` + `000000000000000001`).toString();
      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '9'))
        .to.emit(PlaybuxSBT, 'Transfer')
        .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
    });

    it('should be get id correctly when mint with tokenType 100', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const expectedId = ethers.BigNumber.from(`100` + `000000000000000001`).toString();
      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '100'))
        .to.emit(PlaybuxSBT, 'Transfer')
        .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
    });

    it('should be reverted when call with tokenType 0', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await expect(PlaybuxSBT.mintTo(receiver.address, '0')).to.revertedWith('Invalid token type');
    });

    describe('### Token ID', async () => {
      const mintAndTestTokenURI = async (tokenType, expectedURI) => {
        const [deployer, minter, receiver] = await ethers.getSigners();
        const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, tokenType);
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args[2];
        const tokenURI = await PlaybuxSBT.tokenURI(tokenId);
        expect(tokenURI).to.equal(expectedURI);
      };

      it('should be equal 1e18+1 by type 1', async () => {
        await mintAndTestTokenURI('1', URI + '1');
      });

      it('should be equal 2e18+1 by type 2', async () => {
        await mintAndTestTokenURI('2', URI + '2');
      });

      it('should be equal 7e18+1 by type 7', async () => {
        await mintAndTestTokenURI('7', URI + '7');
      });

      it('should be equal 100e18+1 by type 100', async () => {
        await mintAndTestTokenURI('100', URI + '100');
      });

      it('should be able to get non existed tokenURI', async () => {
        await expect(PlaybuxSBT.tokenURI('9998405605121231545')).to.revertedWith(
          'ERC721Metadata: URI query for nonexistent token'
        );
      });
    });
  });

  describe('## transfer', async () => {
    it('should not able to transfer unless burn or mint', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      await expect(
        PlaybuxSBT.connect(receiver).transferFrom(receiver.address, deployer.address, tokenId)
      ).to.revertedWith('PlaybuxSBT: token is soulbound');
    });

    it('should be able to transfer using burn', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      await PlaybuxSBT.grantRole(FACTORY_ROLE, receiver.address); // act as factory for testing purpose
      await expect(PlaybuxSBT.connect(receiver).burnByTokenId(tokenId)).to.emit(PlaybuxSBT, 'Transfer');
    });
  });

  describe('## locked', async () => {
    it('should always return true because all of them are soulbound token', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const expectedId = ethers.BigNumber.from(`1000000000000000001`);

      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const locked = await PlaybuxSBT.locked(expectedId);
      expect(locked).to.be.true;
    });
  });

  describe('## runningNumberByType', async () => {
    it('should be return 0 when call with tokenType 0', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const supply = await PlaybuxSBT.runningNumberByType('0');
      expect(supply).to.equal(0);
    });

    it('should be return 0 when call with tokenType 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const supply = await PlaybuxSBT.runningNumberByType('1');
      expect(supply).to.equal(0);
    });

    it('should be return 1 when call with tokenType 1 after minting 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const supply = await PlaybuxSBT.runningNumberByType('1');
      expect(supply).to.equal(1);
    });

    it('should be return 2 when call with tokenType 1 and 2 after minting 2 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '2');
      const supply1 = await PlaybuxSBT.runningNumberByType('1');
      expect(supply1).to.equal(1);
      const supply2 = await PlaybuxSBT.runningNumberByType('2');
      expect(supply2).to.equal(1);
    });

    it('should be return 1 when mint with tokenType 1 and 2 and burn 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      expect(await PlaybuxSBT.totalSupply()).to.equal(0);
      await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1');
      await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '2');
      expect(await PlaybuxSBT.totalSupply()).to.equal(2);
      expect(await PlaybuxSBT.runningNumberByType('1')).to.equal(1);
      const tokenId = await PlaybuxSBT.tokenOfOwnerByIndex(deployer.address, 0);
      // transfer to burn address
      await PlaybuxSBT.connect(deployer).burnByTokenId(tokenId);
      const supply1 = await PlaybuxSBT.runningNumberByType('1');
      expect(supply1).to.equal(1); // still 1, because burn is not counted
      const supply2 = await PlaybuxSBT.runningNumberByType('2');
      expect(supply2).to.equal(1);
      expect(await PlaybuxSBT.totalSupply()).to.equal(1);
    });
  });

  describe('## Burn method', async () => {
    describe('### total supply', async () => {
      it('should be decrease after burned', async () => {
        const [deployer, minter, receiver] = await ethers.getSigners();
        expect(await PlaybuxSBT.totalSupply()).to.equal(0);
        await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1');
        expect(await PlaybuxSBT.totalSupply()).to.equal(1);
        const tokenId = await PlaybuxSBT.tokenOfOwnerByIndex(deployer.address, 0);
        // transfer to burn address
        await PlaybuxSBT.connect(deployer).burnByTokenId(tokenId);
        expect(await PlaybuxSBT.totalSupply()).to.equal(0);
      });
    });

    it('should be reverted when call with no _isApprovedOrOwner', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const tokenId = await PlaybuxSBT.tokenOfOwnerByIndex(receiver.address, 0);
      await expect(PlaybuxSBT.connect(deployer).burnByTokenId(tokenId)).to.revertedWith(
        'ERC721: caller is not token owner or approved'
      );
    });

    it(`should be reverted when call with tokenId doesn't exist`, async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(deployer).burnByTokenId('0')).to.revertedWith(
        'ERC721: operator query for nonexistent token'
      );
    });

    it('should burn by owner', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1');
      expect(await PlaybuxSBT.totalSupply()).to.equal(1);
      const tokenId = await PlaybuxSBT.tokenOfOwnerByIndex(deployer.address, 0);
      await PlaybuxSBT.connect(deployer).burnByTokenId(tokenId);

      expect(await PlaybuxSBT.totalSupply()).to.equal(0);
    });

    it('should burn by someone with approved', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      expect(await PlaybuxSBT.totalSupply()).to.equal(1);
      const tokenId = await PlaybuxSBT.tokenOfOwnerByIndex(receiver.address, 0);
      await PlaybuxSBT.connect(receiver).approve(deployer.address, tokenId);
      await PlaybuxSBT.connect(deployer).burnByTokenId(tokenId);
      expect(await PlaybuxSBT.totalSupply()).to.equal(0);
    });
  });

  describe('## mintByTokenId', async () => {
    it('should be revert when call with tokenType 0', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(receiver.address, '0')).to.revertedWith(
        'Invalid token type'
      );
    });

    it('should be revert when call with tokenType 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(receiver.address, '1')).to.revertedWith(
        'Invalid token type'
      );
    });

    it('should be success when call after burn', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1');
      const tokenId = await PlaybuxSBT.tokenOfOwnerByIndex(deployer.address, 0);
      // transfer to burn address
      await PlaybuxSBT.connect(deployer).burnByTokenId(tokenId);
      await PlaybuxSBT.connect(deployer).mintByTokenId(deployer.address, tokenId);
      expect(await PlaybuxSBT.ownerOf(tokenId)).to.equal(deployer.address);
    });

    it('should be reverted exists when call with tokenId 1000000000000000001 after minting 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(receiver.address, '1000000000000000001')).to.revertedWith(
        'ERC721: token already minted'
      );
    });

    it('should be reverted when call with tokenId 1000000000000000002 after minting 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(receiver.address, '1000000000000000002')).to.revertedWith(
        'Token ID is not available'
      );
    });

    it('should be able to mint by token id if never minted this type before', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(receiver.address, '1000000000000000001')).to.revertedWith(
        'This type of token has not been minted yet'
      );
    });

    it('should be able to mint by token id if minted this type before', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1');
      await PlaybuxSBT.connect(deployer).burnByTokenId('1000000000000000001');
      await PlaybuxSBT.connect(deployer).mintByTokenId(deployer.address, '1000000000000000001');
    });
  });

  describe('### Access Control', async () => {
    // grantRole DEFAULT ADMIN to multisig and then use multisig to revoke deployer
    it('should be revert when call mintTo by deployer after revoke deployer', async () => {
      const [deployer, minter, receiver, multisig] = await ethers.getSigners();

      const b4Grant = await PlaybuxSBT.hasRole(DEFAULT_ADMIN_ROLE, multisig.address);
      const b4Revoke = await PlaybuxSBT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

      const factoryRoleB4 = await PlaybuxSBT.hasRole(FACTORY_ROLE, deployer.address);

      await PlaybuxSBT.connect(deployer).grantRole(DEFAULT_ADMIN_ROLE, multisig.address);

      await PlaybuxSBT.connect(multisig).revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);

      const afterGrant = await PlaybuxSBT.hasRole(DEFAULT_ADMIN_ROLE, multisig.address);
      const afterRevoke = await PlaybuxSBT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

      const factoryRoleAfter = await PlaybuxSBT.hasRole(FACTORY_ROLE, deployer.address);

      expect(b4Grant).to.equal(false);
      expect(b4Revoke).to.equal(true);
      expect(afterGrant).to.equal(true);
      expect(afterRevoke).to.equal(false);

      // ! Who grant role still have that admin role after revoke
      expect(factoryRoleB4).to.equal(true);
      expect(factoryRoleAfter).to.equal(true);

      await expect(PlaybuxSBT.connect(deployer).setBaseURI(URI)).to.revertedWith(
        `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE.toLowerCase()}`
      );

      // can setBaseURI
      await PlaybuxSBT.connect(multisig).setBaseURI(URI);
    });

    it('should be revert when call mintTo by non minter', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(receiver).mintTo(receiver.address, '1')).to.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${FACTORY_ROLE.toLowerCase()}`
      );
    });

    it('should be revert when call burn by non burner', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(receiver).burnByTokenId('1')).to.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${FACTORY_ROLE.toLowerCase()}`
      );
    });

    it('should be revert when call setBaseURI by non admin', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(PlaybuxSBT.connect(receiver).setBaseURI(URI)).to.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE.toLowerCase()}`
      );
    });
  });

  describe('### findTypeByTokenId', async () => {
    it('should be return 1 when mint type 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await PlaybuxSBT.findTypeByTokenId(tokenId);
      expect(typeByTokenId).to.equal(1);
    });

    it('should be return 99999 when mint type 99999', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await PlaybuxSBT.findTypeByTokenId(tokenId);
      expect(typeByTokenId).to.equal(99999);
    });

    it('should not round up if type is 88888 and mint at 900000000000003623', async () => {
      const tokenId = '88888900000000000003623';
      const typeByTokenId = await PlaybuxSBT.findTypeByTokenId(tokenId);
      expect(typeByTokenId).to.equal(88888);
    });
  });

  describe('### findTypeStrByTokenId', async () => {
    it('should be return 1 when mint type 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await PlaybuxSBT.findTypeStrByTokenId(tokenId);
      expect(typeByTokenId).to.equal('1');
    });

    it('should be return 99999 when mint type 99999', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await PlaybuxSBT.findTypeStrByTokenId(tokenId);
      expect(typeByTokenId).to.equal('99999');
    });

    it('should not round up if type is 88888 and mint at 900000000000003623', async () => {
      const tokenId = '88888900000000000003623';
      const typeByTokenId = await PlaybuxSBT.findTypeStrByTokenId(tokenId);
      expect(typeByTokenId).to.equal('88888');
    });
  });

  describe('### findTokenIndexByTokenId', async () => {
    it('should be return 1 when mint type 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const tokenIdex = await PlaybuxSBT.findTokenIndexByTokenId(tokenId);
      expect(tokenIdex).to.equal(1);
    });

    it('should be return 1 when mint type 99999', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const tokenIdex = await PlaybuxSBT.findTokenIndexByTokenId(tokenId);
      expect(tokenIdex).to.equal(1);
    });

    it('should not be able to mint type 1 twice', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1');
      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '1')).to.revertedWith(
        'Owner already has token of this type'
      );
    });

    it('should not be able to mint type 99999 twice', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await PlaybuxSBT.connect(deployer).mintTo(receiver.address, '99999');
      await expect(PlaybuxSBT.connect(deployer).mintTo(receiver.address, '99999')).to.revertedWith(
        'Owner already has token of this type'
      );
    });

    it('should not round up if type is 88888 and mint at 900000000000003623', async () => {
      const tokenId = '88888900000000000003623';
      const typeByTokenId = await PlaybuxSBT.findTokenIndexByTokenId(tokenId);
      expect(typeByTokenId).to.equal('900000000000003623');
    });
  });

  describe('### Full case', async () => {
    /*
     * 1. mint 1 NFT
     * 2. mint 1 NFT
     * 3. burn index 1
     * 4. mint index 1
     * 5. fail to mint index 1
     * 6. fail to mint index 20
     * 7. mint 1 NFT
     */

    it('#### 1 full case', async () => {
      // 1
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      expect(await PlaybuxSBT.totalSupply()).to.equal(1);

      // 2
      const tx2 = await PlaybuxSBT.connect(deployer).mintTo(deployer.address, '2');
      const receipt2 = await tx2.wait();
      const tokenId2 = receipt2.events[0].args[2];
      expect(await PlaybuxSBT.totalSupply()).to.equal(2);

      // 3
      await PlaybuxSBT.connect(deployer).burnByTokenId(tokenId);
      const supply = await PlaybuxSBT.runningNumberByType('1');
      expect(supply).to.equal(1);
      expect(await PlaybuxSBT.totalSupply()).to.equal(1);

      // 4
      const tx3 = await PlaybuxSBT.connect(deployer).mintByTokenId(deployer.address, tokenId);

      const receipt3 = await tx3.wait();
      const tokenId3 = receipt3.events[0].args[2];
      expect(await PlaybuxSBT.totalSupply()).to.equal(2);
      expect(await PlaybuxSBT.runningNumberByType('1')).to.equal(1); // mint by token id not change runningNumberByType because it is running number

      // 5
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(deployer.address, tokenId)).to.be.revertedWith(
        'ERC721: token already minted'
      );

      // 6
      await expect(PlaybuxSBT.connect(deployer).mintByTokenId(deployer.address, tokenId2.add(1))).to.be.revertedWith(
        'Token ID is not available'
      );

      // 7
      await expect(PlaybuxSBT.connect(deployer).mintTo(deployer.address, '1')).to.be.revertedWith(
        'Owner already has token of this type'
      );
      expect(await PlaybuxSBT.totalSupply()).to.equal(2);
      expect(await PlaybuxSBT.runningNumberByType('1')).to.equal(1);
    });
  });
});
