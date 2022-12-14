const { ethers } = require('hardhat');

module.exports = async ({ deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);
  const BUSD = await ethers.getContract('MockBUSD');
  const PlaybuxSBT = await ethers.getContract('PlaybuxSBT');

  const args = [BUSD.address, PlaybuxSBT.address];

  await deploy('PlaybuxSBTFactory', {
    contract: 'PlaybuxSBTFactory',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxSBTFactory');
  console.log(
    ` |> hh verify --contract contracts/pre-launch-event/PlaybuxSBTFactory.sol:PlaybuxSBTFactory --network ${
      network.name
    } ${contract.address} ${args.join(' ')}`
  );
};

module.exports.tags = ['PlaybuxSBTFactory'];
