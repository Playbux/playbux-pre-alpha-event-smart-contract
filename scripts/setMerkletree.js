const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;

let addresses = require('../json/addresses.json');
const PROD_ADDRESS = require('../json/prod_address.json');

const { getMerkleTree } = require('../lib/merkletree');

async function setMerkleTree() {
  const playbuxClaim = await ethers.getContract('PlaybuxClaim');

  if (network.name === 'bsc') {
    addresses = PROD_ADDRESS;
  }

  const merkleTree = getMerkleTree(PROD_ADDRESS);
  console.log('merkleTree.getHexRoot() = ', merkleTree.getHexRoot());
  // const tx = await playbuxClaim.setMerkleRoot(merkleTree.getHexRoot());
  // await tx.wait();
  // console.log('Merkle root set', tx.hash);
}

setMerkleTree()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
