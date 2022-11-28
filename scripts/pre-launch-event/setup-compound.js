const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;
const FACTORY_ROLE = id('FACTORY_ROLE');

async function main() {
  const PlaybuxQuestNFT = await ethers.getContract('PlaybuxQuestNFT');
  const NFTCompound = await ethers.getContract('NFTCompound');
  let tx;

  // grantRole
  tx = await PlaybuxQuestNFT.grantRole(FACTORY_ROLE, NFTCompound.address);
  await tx.wait();
  console.log('role granted', tx.hash);

  // set limit
  tx = await NFTCompound.setCompoundLimitPerDay('100000');
  await tx.wait();
  console.log('set limit', tx.hash);

  // unpause
  tx = await NFTCompound.unpause();
  await tx.wait();
  console.log('unpaused', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
