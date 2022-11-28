const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  const args = [
    deployer.address,
    '500', // 500/100 = 5%
    'ipfs://QmZzTKnHGGALcpf5N7GoyQYDJ6ngS2gSopeEao8cfVJePf/', // ! slash at the end
  ];
  await deploy('PlaybuxQuestNFT', {
    contract: 'PlaybuxQuestNFT',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxQuestNFT');
  console.log(`|> npx hardhat verify --network ${network.name} ${contract.address} ${args.join(' ')}`);
};

module.exports.tags = ['PlaybuxQuestNFT', 'QuestNFT'];
