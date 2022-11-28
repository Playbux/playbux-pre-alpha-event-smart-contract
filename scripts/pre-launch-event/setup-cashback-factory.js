const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;
const FACTORY_ROLE = id('FACTORY_ROLE');

async function main() {
  const OneDayCashbackNFT = await ethers.getContract('OneDayCashbackNFT');
  const OneDayCashbackFactory = await ethers.getContract('OneDayCashbackFactory');
  let tx;

  // grantRole
  tx = await OneDayCashbackNFT.grantRole(FACTORY_ROLE, OneDayCashbackFactory.address);
  await tx.wait();
  console.log('role granted', tx.hash);

  // unpause
  tx = await OneDayCashbackFactory.unpause();
  await tx.wait();
  console.log('unpaused', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
