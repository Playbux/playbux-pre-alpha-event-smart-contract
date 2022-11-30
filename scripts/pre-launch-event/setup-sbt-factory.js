const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;
const FACTORY_ROLE = id('FACTORY_ROLE');

async function main() {
  const PlaybuxSBT = await ethers.getContract('PlaybuxSBT');
  const PlaybuxSBTFactory = await ethers.getContract('PlaybuxSBTFactory');
  let tx;

  // grantRole
  tx = await PlaybuxSBT.grantRole(FACTORY_ROLE, PlaybuxSBTFactory.address);
  await tx.wait();
  console.log('role granted', tx.hash);

  // unpause
  tx = await PlaybuxSBTFactory.unpause();
  await tx.wait();
  console.log('unpaused', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
