const { parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');

async function main() {
  const BUSDFactory = await ethers.getContract('BUSDFactory');
  const BUSD = await ethers.getContract('MockBUSD');
  let tx;
  // topup busd to contract
  tx = await BUSD.transfer(BUSDFactory.address, ethers.utils.parseEther('10000000'));
  console.log('transfered', tx.hash);

  // set limit
  tx = await BUSDFactory.setWithdrawalLimitPerDay(parseEther('10000000'));
  console.log('set limit', tx.hash);

  // unpause
  tx = await BUSDFactory.unpause();
  await tx.wait();
  console.log('unpaused', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
