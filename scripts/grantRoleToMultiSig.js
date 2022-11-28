const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

async function grantRole() {
  const playbuxClaim = await ethers.getContract('PlaybuxClaim');
  const playbuxQuestNFT = await ethers.getContract('PlaybuxQuestNFT');

  const grantTarget = '0xafdF43d15b0601D6E6E8597904926076c8f6AC3F';
  // const revokeTarget = playbuxQuestNFT.address;

  // grantRole
  let tx = await playbuxQuestNFT.grantRole(DEFAULT_ADMIN_ROLE, grantTarget);
  await tx.wait();
  console.log('role granted', tx.hash);

  // revoke
  // tx = await playbuxQuestNFT.revokeRole(DEFAULT_ADMIN_ROLE, revokeTarget);
  // await tx.wait();
  // console.log('role revoked', tx.hash);

  // unpause
  // await playbuxClaim.unpause();
}

grantRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
