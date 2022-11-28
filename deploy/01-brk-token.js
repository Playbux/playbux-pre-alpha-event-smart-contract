const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);

  await deploy('BRK', {
    contract: 'BRK',
    from: deployer.address,
    args: [],
    log: true,
  });

  const contract = await ethers.getContract('BRK');
  console.log(
    ` |> hh verify --contract contracts/BRK.sol:BRK --network ${network.name} ${contract.address}`
  );
};

module.exports.tags = ['BRK'];
