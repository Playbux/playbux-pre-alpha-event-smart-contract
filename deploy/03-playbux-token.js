const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);

  await deploy('PBUX', {
    contract: 'PBUX',
    from: deployer.address,
    args: [],
    log: true,
  });

  const contract = await ethers.getContract('PBUX');
  console.log(
    ` |> hh verify --contract contracts/PBUX.sol:PBUX --network ${network.name} ${contract.address}`
  );
};

module.exports.tags = ['PBUX'];
