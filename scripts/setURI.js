const { ethers } = require('hardhat');
const {
  utils: { id },
} = ethers;

async function setURI() {
  const playbuxQuestNFT = await ethers.getContract('PlaybuxQuestNFT');

  const uri = 'ipfs://QmZzTKnHGGALcpf5N7GoyQYDJ6ngS2gSopeEao8cfVJePf/';
  const tx = await playbuxQuestNFT.setBaseURI(uri);
  await tx.wait();
}

setURI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
