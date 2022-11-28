const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);
  const playbuxQuestNFT = await ethers.getContract('PlaybuxQuestNFT');
  const backendAdmin = process.env.BACKEND_ADDRESS_COMPOUND_NFT;

  const args = [playbuxQuestNFT.address, backendAdmin];

  await deploy('NFTCompound', {
    contract: 'NFTCompound',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('NFTCompound');
  console.log(
    ` |> hh verify --contract contracts/pre-launch-event/NFTCompound.sol:NFTCompound --network ${network.name} ${
      contract.address
    } ${args.join(' ')}`
  );
};

module.exports.tags = ['NFTCompound'];
