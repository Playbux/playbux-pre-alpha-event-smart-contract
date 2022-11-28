const { ethers } = require('hardhat');

const mineBlock = () => ethers.provider.send('evm_mine', []);

const fastForwardBlock = (number) => {
  return ethers.provider.send('hardhat_mine', ['0x' + number.toString(16)]);
};

const fastForwardToBlock = async (number) => {
  const now = await ethers.provider.getBlockNumber();
  return fastForwardBlock(number - now);
};

const resetEVM = async () => {
  await ethers.provider.send('hardhat_reset', []);
  await mineBlock();
};

module.exports = {
  fastForwardBlock,
  fastForwardToBlock,
  resetEVM,
};
