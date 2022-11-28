const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log('deployer', deployer.address);
  const busd = await ethers.getContract('MockBUSD');
  const backendAdmin = process.env.BACKEND_ADDRESS_WITHDRAW_BUSD;

  const args = [busd.address, backendAdmin];
  await deploy('BUSDFactory', {
    contract: 'BUSDFactory',
    from: deployer.address,
    args,
    log: true,
  });

  const contract = await ethers.getContract('BUSDFactory');
  console.log(
    ` |> hh verify --contract contracts/pre-launch-event/BUSDFactory.sol:BUSDFactory --network ${network.name} ${
      contract.address
    } ${args.join(' ')}`
  );
};

module.exports.tags = ['BUSDFactory'];
