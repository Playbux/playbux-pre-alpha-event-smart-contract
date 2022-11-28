const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();
  const PBUX = await ethers.getContract('PBUX');

  const admin = '0xE1C8a1A74a0C1289BD48B55FAA5f683f789Ca7CE'; // rely on backend private key
  console.log('deployer', deployer.address);
  console.log('PBUX', PBUX.address);
  console.log('admin', admin);

  const args = [PBUX.address, admin];
  await deploy('PlaybuxBridgePBUX', {
    contract: 'PlaybuxBridge',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxBridgePBUX');
  console.log(
    `|> hh verify --network ${network.name} ${contract.address} ${args.join(
      ' '
    )}`
  );
};

module.exports.tags = ['PlaybuxBridgePBUX'];
