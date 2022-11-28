const ethers = require('ethers');
const { keccak256 } = require('ethers/lib/utils');
const { MerkleTree } = require('merkletreejs');

export function hashToken(account, id) {
  return Buffer.from(ethers.utils.solidityKeccak256(['address', 'uint256'], [account, id]).slice(2), 'hex');
}

export function getMerkleTree(claimers) {
  console.log('claimers.length = ', claimers.length);
  return new MerkleTree(
    claimers.map((claimer, i) => hashToken(claimer.address, claimer.id)),
    keccak256,
    { sortPairs: true }
  );
}
