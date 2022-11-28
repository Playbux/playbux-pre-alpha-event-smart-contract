const { ethers } = require('hardhat');

module.exports = async ({ deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  const args = [
    'ipfs://QmcKPyF2iwudk9wEyXeBJFNLQNvmTjoR4trELFZzbuv9sU/', // ! slash at the end
  ];
  await deploy('PlaybuxSBT', {
    contract: 'PlaybuxSBT',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxSBT');
  console.log(`|> npx hardhat verify --network ${network.name} ${contract.address} ${args.join(' ')}`);
};

module.exports.tags = ['PlaybuxSBT'];
