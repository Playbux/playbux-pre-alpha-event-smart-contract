const { ethers } = require('hardhat');
let addresses = require('../json/addresses.json');
const PROD_ADDRESS = require('../json/prod_address.json');

const { getMerkleTree } = require('../lib/merkletree');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const accounts = await ethers.getSigners();
  let tx;
  const nft = await ethers.getContract('PlaybuxQuestNFT');

  if (network.name === 'ropsten') {
    addresses = PROD_ADDRESS;
  }

  const args = [nft.address];

  await deploy('PlaybuxClaim', {
    contract: 'PlaybuxClaim',
    from: accounts[0].address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxClaim');
  console.log(
    `|> npx hardhat verify --network ${network.name} ${
      contract.address
    } ${args.join(' ')}`
  );

  const merkleTree = getMerkleTree(addresses);
  console.log('merkleTree.getHexRoot() = ', merkleTree.getHexRoot());
  tx = await contract.setMerkleRoot(merkleTree.getHexRoot());
  await tx.wait();
  console.log('Merkle root set', tx.hash);
};

module.exports.tags = ['PlaybuxClaim', 'QuestNFT'];
