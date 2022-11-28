const { expect } = require('chai');
const { ethers } = require('hardhat');
const ADDRESSES = require('../json/addresses.json');
const { deploy } = require('./utils');

const {
  utils: { id },
} = ethers;

const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
const FACTORY_ROLE = id('FACTORY_ROLE');

const URI = 'ipfs://QmPMdFUM8PZCVMLfpPdY9wnjbhJKQFK4P7hnTTMDC473R6/';

describe('Playbux Quest NFT', async () => {
  // Contract
  let playbuxQuestNFT;

  // Merkletree
  let merkleTree;

  async function grantRole(address) {
    const tx = await playbuxQuestNFT.grantRole(FACTORY_ROLE, address);
    await tx.wait();
  }

  beforeEach(async () => {
    // Deploy contract
    const [deployer, minter] = await ethers.getSigners();

    playbuxQuestNFT = await deploy('PlaybuxQuestNFT', [
      deployer.address, // deployer
      '1000', // 1000/100 = 10%
      URI,
    ]);

    // grantRole
    await grantRole(minter.address);
    await grantRole(deployer.address);
  });

  describe('## mintTo method', async () => {
    it('should be get id correctly when call 20 times with tokenType 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      for (let i = 0; i < 20; i++) {
        const expectedId = ethers.BigNumber.from(`1000000000000000001`)
          .add(ethers.BigNumber.from(`${i}`))
          .toString();

        await expect(playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1'))
          .to.emit(playbuxQuestNFT, 'Transfer')
          .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
      }
    });

    it('should be get id correctly when call 20 times with tokenType 2', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      for (let i = 0; i < 20; i++) {
        const expectedId = ethers.BigNumber.from(`2000000000000000001`)
          .add(ethers.BigNumber.from(`${i}`))
          .toString();

        await expect(playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '2'))
          .to.emit(playbuxQuestNFT, 'Transfer')
          .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
      }
    });

    it('should be get id correctly when call 20 times with tokenType 3', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      for (let i = 0; i < 20; i++) {
        const expectedId = ethers.BigNumber.from(`3000000000000000001`)
          .add(ethers.BigNumber.from(`${i}`))
          .toString();

        await expect(playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '3'))
          .to.emit(playbuxQuestNFT, 'Transfer')
          .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
      }
    });

    it('should be get id correctly when call 20 times with tokenType 9', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      for (let i = 0; i < 20; i++) {
        const expectedId = ethers.BigNumber.from(`9` + `000000000000000001`)
          .add(ethers.BigNumber.from(`${i}`))
          .toString();
        await expect(playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '9'))
          .to.emit(playbuxQuestNFT, 'Transfer')
          .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
      }
    });

    it('should be get id correctly when call 20 times with tokenType 100', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      for (let i = 0; i < 20; i++) {
        const expectedId = ethers.BigNumber.from(`100` + `000000000000000001`)
          .add(ethers.BigNumber.from(`${i}`))
          .toString();
        await expect(playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '100'))
          .to.emit(playbuxQuestNFT, 'Transfer')
          .withArgs(ethers.constants.AddressZero, receiver.address, expectedId);
      }
    });

    it('should be reverted when call with tokenType 0', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await expect(playbuxQuestNFT.mintTo(receiver.address, '0')).to.revertedWith('Invalid token type');
    });

    describe('### Token ID', async () => {
      const mintAndTestTokenURI = async (tokenType, expectedURI) => {
        const [deployer, minter, receiver] = await ethers.getSigners();
        const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, tokenType);
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args[2];
        const tokenURI = await playbuxQuestNFT.tokenURI(tokenId);
        expect(tokenURI).to.equal(expectedURI);
      };

      it('should be equal 1e18+1 by type 1', async () => {
        for (let i = 0; i < 20; i++) {
          await mintAndTestTokenURI('1', URI + '1');
        }
      });

      it('should be equal 2e18+1 by type 2', async () => {
        for (let i = 0; i < 20; i++) {
          await mintAndTestTokenURI('2', URI + '2');
        }
      });

      it('should be equal 7e18+1 by type 7', async () => {
        for (let i = 0; i < 20; i++) {
          await mintAndTestTokenURI('7', URI + '7');
        }
      });

      it('should be equal 100e18+1 by type 100', async () => {
        for (let i = 0; i < 20; i++) {
          await mintAndTestTokenURI('100', URI + '100');
        }
      });
    });
  });

  describe('## tokenSupplyByType', async () => {
    it('should be return 0 when call with tokenType 0', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const supply = await playbuxQuestNFT.tokenSupplyByType('0');
      expect(supply).to.equal(0);
    });

    it('should be return 0 when call with tokenType 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const supply = await playbuxQuestNFT.tokenSupplyByType('1');
      expect(supply).to.equal(0);
    });

    it('should be return 1 when call with tokenType 1 after minting 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const supply = await playbuxQuestNFT.tokenSupplyByType('1');
      expect(supply).to.equal(1);
    });

    it('should be return 2 when call with tokenType 1 after minting 2 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const supply = await playbuxQuestNFT.tokenSupplyByType('1');
      expect(supply).to.equal(2);
    });

    it('should be return 2 when call with tokenType 1 after minting 2 NFT and burn 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      expect(await playbuxQuestNFT.totalSupply()).to.equal(0);
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      expect(await playbuxQuestNFT.totalSupply()).to.equal(2);
      expect(await playbuxQuestNFT.tokenSupplyByType('1')).to.equal(2);
      const tokenId = await playbuxQuestNFT.tokenOfOwnerByIndex(receiver.address, 0);
      // transfer to burn address
      await playbuxQuestNFT.connect(receiver).transferFrom(receiver.address, deployer.address, tokenId);
      await playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId);
      const supply = await playbuxQuestNFT.tokenSupplyByType('1');
      expect(supply).to.equal(2);
      expect(await playbuxQuestNFT.totalSupply()).to.equal(1);
    });
  });

  describe('## Burn method', async () => {
    describe('### total supply', async () => {
      it('should be decrease after burned', async () => {
        const [deployer, minter, receiver] = await ethers.getSigners();
        expect(await playbuxQuestNFT.totalSupply()).to.equal(0);
        await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
        expect(await playbuxQuestNFT.totalSupply()).to.equal(1);
        const tokenId = await playbuxQuestNFT.tokenOfOwnerByIndex(receiver.address, 0);
        // transfer to burn address
        await playbuxQuestNFT.connect(receiver).transferFrom(receiver.address, deployer.address, tokenId);
        await playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId);
        expect(await playbuxQuestNFT.totalSupply()).to.equal(0);
      });
    });

    it('should be reverted when call with no _isApprovedOrOwner', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const tokenId = await playbuxQuestNFT.tokenOfOwnerByIndex(receiver.address, 0);
      await expect(playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId)).to.revertedWith(
        'ERC721: caller is not token owner or approved'
      );
    });

    it(`should be reverted when call with tokenId doesn't exist`, async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(playbuxQuestNFT.connect(deployer).burnByTokenId('0')).to.revertedWith(
        'ERC721: operator query for nonexistent token'
      );
    });

    it('should burn by owner', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await playbuxQuestNFT.connect(deployer).mintTo(deployer.address, '1');
      expect(await playbuxQuestNFT.totalSupply()).to.equal(1);
      const tokenId = await playbuxQuestNFT.tokenOfOwnerByIndex(deployer.address, 0);
      await playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId);

      expect(await playbuxQuestNFT.totalSupply()).to.equal(0);
    });

    it('should burn by someone with approved', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();

      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      expect(await playbuxQuestNFT.totalSupply()).to.equal(1);
      const tokenId = await playbuxQuestNFT.tokenOfOwnerByIndex(receiver.address, 0);
      await playbuxQuestNFT.connect(receiver).approve(deployer.address, tokenId);
      await playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId);
      expect(await playbuxQuestNFT.totalSupply()).to.equal(0);
    });
  });

  describe('## mintByTokenId', async () => {
    it('should be revert when call with tokenType 0', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, '0')).to.revertedWith(
        'Invalid token type'
      );
    });

    it('should be revert when call with tokenType 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, '1')).to.revertedWith(
        'Invalid token type'
      );
    });

    it('should be success when call after burn', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const tokenId = await playbuxQuestNFT.tokenOfOwnerByIndex(receiver.address, 0);
      // transfer to burn address
      await playbuxQuestNFT.connect(receiver).transferFrom(receiver.address, deployer.address, tokenId);
      await playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId);
      await playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, tokenId);
      expect(await playbuxQuestNFT.ownerOf(tokenId)).to.equal(receiver.address);
    });

    it('should be reverted exists when call with tokenId 1000000000000000001 after minting 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      await expect(
        playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, '1000000000000000001')
      ).to.revertedWith('ERC721: token already minted');
    });

    it('should be reverted when call with tokenId 1000000000000000002 after minting 1 NFT', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      await expect(
        playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, '1000000000000000002')
      ).to.revertedWith('Token ID is not available');
    });
  });

  describe('### Access Control', async () => {
    // grantRole DEFAULT ADMIN to multisig and then use multisig to revoke deployer
    it('should be revert when call mintTo by deployer after revoke deployer', async () => {
      const [deployer, minter, receiver, multisig] = await ethers.getSigners();

      const b4Grant = await playbuxQuestNFT.hasRole(DEFAULT_ADMIN_ROLE, multisig.address);
      const b4Revoke = await playbuxQuestNFT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

      const factoryRoleB4 = await playbuxQuestNFT.hasRole(FACTORY_ROLE, deployer.address);

      await playbuxQuestNFT.connect(deployer).grantRole(DEFAULT_ADMIN_ROLE, multisig.address);

      await playbuxQuestNFT.connect(multisig).revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);

      const afterGrant = await playbuxQuestNFT.hasRole(DEFAULT_ADMIN_ROLE, multisig.address);
      const afterRevoke = await playbuxQuestNFT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

      const factoryRoleAfter = await playbuxQuestNFT.hasRole(FACTORY_ROLE, deployer.address);

      expect(b4Grant).to.equal(false);
      expect(b4Revoke).to.equal(true);
      expect(afterGrant).to.equal(true);
      expect(afterRevoke).to.equal(false);

      // ! Who grant role still have that admin role after revoke
      expect(factoryRoleB4).to.equal(true);
      expect(factoryRoleAfter).to.equal(true);

      await expect(playbuxQuestNFT.connect(deployer).setBaseURI(URI)).to.revertedWith(
        `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE.toLowerCase()}`
      );

      // can setBaseURI
      await playbuxQuestNFT.connect(multisig).setBaseURI(URI);
    });

    it('should be revert when call mintTo by non minter', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(playbuxQuestNFT.connect(receiver).mintTo(receiver.address, '1')).to.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${FACTORY_ROLE.toLowerCase()}`
      );
    });

    it('should be revert when call burn by non burner', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(playbuxQuestNFT.connect(receiver).burnByTokenId('1')).to.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${FACTORY_ROLE.toLowerCase()}`
      );
    });

    it('should be revert when call setBaseURI by non admin', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await expect(playbuxQuestNFT.connect(receiver).setBaseURI(URI)).to.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE.toLowerCase()}`
      );
    });
  });

  describe('### findTypeByTokenId', async () => {
    it('should be return 1 when mint type 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await playbuxQuestNFT.findTypeByTokenId(tokenId);
      expect(typeByTokenId).to.equal(1);
    });

    it('should be return 99999 when mint type 99999', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await playbuxQuestNFT.findTypeByTokenId(tokenId);
      expect(typeByTokenId).to.equal(99999);
    });

    it('should not round up if type is 88888 and mint at 900000000000003623', async () => {
      const tokenId = '88888900000000000003623';
      const typeByTokenId = await playbuxQuestNFT.findTypeByTokenId(tokenId);
      expect(typeByTokenId).to.equal(88888);
    });
  });

  describe('### findTypeStrByTokenId', async () => {
    it('should be return 1 when mint type 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await playbuxQuestNFT.findTypeStrByTokenId(tokenId);
      expect(typeByTokenId).to.equal('1');
    });

    it('should be return 99999 when mint type 99999', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const typeByTokenId = await playbuxQuestNFT.findTypeStrByTokenId(tokenId);
      expect(typeByTokenId).to.equal('99999');
    });

    it('should not round up if type is 88888 and mint at 900000000000003623', async () => {
      const tokenId = '88888900000000000003623';
      const typeByTokenId = await playbuxQuestNFT.findTypeStrByTokenId(tokenId);
      expect(typeByTokenId).to.equal('88888');
    });
  });

  describe('### findTokenIndexByTokenId', async () => {
    it('should be return 1 when mint type 1', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const tokenIdex = await playbuxQuestNFT.findTokenIndexByTokenId(tokenId);
      expect(tokenIdex).to.equal(1);
    });

    it('should be return 1 when mint type 99999', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const tokenIdex = await playbuxQuestNFT.findTokenIndexByTokenId(tokenId);
      expect(tokenIdex).to.equal(1);
    });

    it('should be return 2 when mint type 1 twice', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const tokenIdex = await playbuxQuestNFT.findTokenIndexByTokenId(tokenId);
      expect(tokenIdex).to.equal(2);
    });

    it('should be return 2 when mint type 99999 twice', async () => {
      const [deployer, minter, receiver] = await ethers.getSigners();
      await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '99999');
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '99999');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      const tokenIdex = await playbuxQuestNFT.findTokenIndexByTokenId(tokenId);
      expect(tokenIdex).to.equal(2);
    });

    it('should not round up if type is 88888 and mint at 900000000000003623', async () => {
      const tokenId = '88888900000000000003623';
      const typeByTokenId = await playbuxQuestNFT.findTokenIndexByTokenId(tokenId);
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
      const tx = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args[2];
      expect(await playbuxQuestNFT.totalSupply()).to.equal(1);

      // 2
      const tx2 = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt2 = await tx2.wait();
      const tokenId2 = receipt2.events[0].args[2];
      expect(await playbuxQuestNFT.totalSupply()).to.equal(2);

      // 3
      await playbuxQuestNFT.connect(receiver).transferFrom(receiver.address, deployer.address, tokenId);
      await playbuxQuestNFT.connect(deployer).burnByTokenId(tokenId);
      const supply = await playbuxQuestNFT.tokenSupplyByType('1');
      expect(supply).to.equal(2);
      expect(await playbuxQuestNFT.totalSupply()).to.equal(1);

      // 4
      const tx3 = await playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, tokenId);

      const receipt3 = await tx3.wait();
      const tokenId3 = receipt3.events[0].args[2];
      expect(await playbuxQuestNFT.totalSupply()).to.equal(2);
      expect(await playbuxQuestNFT.tokenSupplyByType('1')).to.equal(2);

      // 5
      await expect(playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, tokenId)).to.be.revertedWith(
        'ERC721: token already minted'
      );

      // 6
      await expect(
        playbuxQuestNFT.connect(deployer).mintByTokenId(receiver.address, tokenId2.add(1))
      ).to.be.revertedWith('Token ID is not available');

      // 7
      const tx4 = await playbuxQuestNFT.connect(deployer).mintTo(receiver.address, '1');
      const receipt4 = await tx4.wait();
      const tokenId4 = receipt4.events[0].args[2];
      expect(await playbuxQuestNFT.totalSupply()).to.equal(3);
      expect(await playbuxQuestNFT.tokenSupplyByType('1')).to.equal(3);
    });
  });

  // royalties fee test, set then get
});
