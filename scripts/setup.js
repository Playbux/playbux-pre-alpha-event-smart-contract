const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;
const FACTORY_ROLE = id('FACTORY_ROLE');

async function grantRoleAndUnpause() {
  const playbuxClaim = await ethers.getContract('PlaybuxClaim');
  const playbuxQuestNFT = await ethers.getContract('PlaybuxQuestNFT');

  // grantRole
  const tx = await playbuxQuestNFT.grantRole(FACTORY_ROLE, playbuxClaim.address);
  await tx.wait();
  console.log('role granted', tx.hash);

  // unpause
  await playbuxClaim.unpause();
}

grantRoleAndUnpause()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
