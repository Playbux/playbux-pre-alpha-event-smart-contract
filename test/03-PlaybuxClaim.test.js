const { expect } = require('chai');
const { ethers } = require('hardhat');
const ADDRESSES = require('../json/addresses.json');
const { getMerkleTree, hashToken } = require('../lib/merkletree');
const { deploy } = require('./utils');

const {
  utils: { id },
} = ethers;
const FACTORY_ROLE = id('FACTORY_ROLE');

const mnemonic = 'guilt nation burst armed glad race cloth glue lumber kitchen echo electric captain arctic puppy';

describe('Playbux Claim', async () => {
  // Contract
  let playbuxClaim;
  let playbuxQuestNFT;

  // Merkletree
  let merkleTree;

  async function grantRole() {
    const tx = await playbuxQuestNFT.grantRole(FACTORY_ROLE, playbuxClaim.address);
    await tx.wait();
  }

  before(() => {
    // Create MerkleTree
    const claimers = ADDRESSES.map((user) => ({
      address: user.address,
      id: user.id,
    }));
    merkleTree = getMerkleTree(claimers);
  });

  beforeEach(async () => {
    // Deploy contract
    const [deployer] = await ethers.getSigners();

    playbuxQuestNFT = await deploy('PlaybuxQuestNFT', [
      deployer.address, // deployer
      '1000', // 1000/100 = 10%
      'ipfs://QmPMdFUM8PZCVMLfpPdY9wnjbhJKQFK4P7hnTTMDC473R6',
    ]);

    const args = [playbuxQuestNFT.address];

    playbuxClaim = await deploy('PlaybuxClaim', args);

    const tx = await playbuxClaim.setMerkleRoot(merkleTree.getHexRoot());
    await tx.wait();

    // unpause
    await playbuxClaim.unpause();

    // grantRole
    await grantRole();
  });

  describe('## canClaim', async () => {
    it('should be false when call canClaim with someone', async () => {
      const first = ADDRESSES[0];
      const address = first.address;
      const id = first.id;
      const badId = 50;
      const proof = merkleTree.getHexProof(hashToken(address, id));
      const canClaim = await playbuxClaim.canClaim(address, badId, proof);
      expect(canClaim).to.equal(false);
    });

    it('should be true when call canClaim correctly', async function () {
      const first = ADDRESSES[0];
      const address = first.address;
      const id = first.id;

      const proof = merkleTree.getHexProof(hashToken(address, id));
      const canClaim = await playbuxClaim.canClaim(address, id, proof);
      expect(canClaim).to.equal(true);
    });
  });

  describe('## claim', async () => {
    it('should be emit event when claim', async () => {
      const [first] = await ethers.getSigners();

      const fromJson = ADDRESSES[0];

      const proof = merkleTree.getHexProof(hashToken(fromJson.address, fromJson.id));

      await expect(playbuxClaim.connect(first).claim(fromJson.id, proof))
        .to.emit(playbuxClaim, 'Claim')
        .withArgs(first.address, fromJson.id);
    });

    it('should be reverted if claimed', async () => {
      const [first, second] = await ethers.getSigners();

      const fromJson = ADDRESSES[0];

      const proof = merkleTree.getHexProof(hashToken(fromJson.address, fromJson.id));

      await expect(playbuxClaim.connect(first).claim(fromJson.id, proof))
        .to.emit(playbuxClaim, 'Claim')
        .withArgs(first.address, fromJson.id);

      await expect(playbuxClaim.connect(first).claim(fromJson.id, proof)).to.revertedWith('Already claimed');

      // second
      const fromJson2 = ADDRESSES[1];

      const proof2 = merkleTree.getHexProof(hashToken(fromJson2.address, fromJson2.id));

      await expect(playbuxClaim.connect(second).claim(fromJson2.id, proof2))
        .to.emit(playbuxClaim, 'Claim')
        .withArgs(second.address, fromJson2.id);

      await expect(playbuxClaim.connect(second).claim(fromJson2.id, proof2)).to.revertedWith('Already claimed');
    });
  });

  describe('## Gas', async () => {
    it.skip('should get length of proof to be 18', async () => {
      for (let i = 0; i < ADDRESSES.length; i++) {
        const ele = ADDRESSES[i];

        const proof = merkleTree.getHexProof(hashToken(ele.address, ele.id));
        const length = proof.length;
        console.log('proof = ', proof);

        console.log('i = ', i, length);

        expect(length).to.equal(18);
      }
    });

    it.skip('should get length of proof less than 10', async () => {
      const [first, second] = await ethers.getSigners();
      const [firstAddress, secondAddress] = [first.address, second.address];
      const [firstId, secondId] = [1, 2];
      const [firstProof, secondProof] = [
        merkleTree.getHexProof(hashToken(firstAddress, firstId)),
        merkleTree.getHexProof(hashToken(secondAddress, secondId)),
      ];
      const [firstClaim, secondClaim] = [
        await playbuxClaim.connect(first).claim(firstId, firstProof),
        await playbuxClaim.connect(second).claim(secondId, secondProof),
      ];
      const [firstGas, secondGas] = [firstClaim.gasUsed, secondClaim.gasUsed];
      expect(firstGas).to.be.lessThan(20);
      expect(secondGas).to.be.lessThan(20);
    });
  });
});
