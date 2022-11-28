const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();
  const BRK = await ethers.getContract('BRK');

  const admin = '0xE1C8a1A74a0C1289BD48B55FAA5f683f789Ca7CE'; // rely on backend private key
  console.log('deployer', deployer.address);
  console.log('BRK', BRK.address);
  console.log('admin', admin);

  const args = [BRK.address, admin];
  await deploy('PlaybuxBridgeBRK', {
    contract: 'PlaybuxBridge',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxBridgeBRK');
  console.log(
    `|> hh verify --network ${network.name} ${contract.address} ${args.join(
      ' '
    )}`
  );
};

module.exports.tags = ['PlaybuxBridgeBRK'];
