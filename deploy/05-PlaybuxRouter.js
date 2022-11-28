const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  const router = '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F';
  console.log('deployer', deployer.address);
    console.log('router', router);

  const args = [router];
  await deploy('PlaybuxRouter', {
    contract: 'PlaybuxRouter',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('PlaybuxRouter');
  console.log(
    `|> hh verify --network ${network.name} ${contract.address} ${args.join(
      ' '
    )}`
  );
};

module.exports.tags = ['PlaybuxRouter'];
