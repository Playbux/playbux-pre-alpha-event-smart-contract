const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);

  await deploy('MockBUSD', {
    contract: 'MockBUSD',
    from: deployer.address,
    args: [],
    log: true,
  });

  const contract = await ethers.getContract('MockBUSD');
  console.log(` |> hh verify --network ${network.name} ${contract.address}`);
};

module.exports.tags = ['MockBUSD'];
