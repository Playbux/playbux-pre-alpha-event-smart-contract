const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);
  const playbuxQuestNFT = await ethers.getContract('PlaybuxQuestNFT');
  const backendAdmin = process.env.BACKEND_ADDRESS_BUY_NFT;

  const args = [playbuxQuestNFT.address, backendAdmin];

  await deploy('NFTFactory', {
    contract: 'NFTFactory',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('NFTFactory');
  console.log(
    ` |> hh verify --contract contracts/pre-launch-event/NFTFactory.sol:NFTFactory --network ${network.name} ${
      contract.address
    } ${args.join(' ')}`
  );
};

module.exports.tags = ['NFTFactory'];
