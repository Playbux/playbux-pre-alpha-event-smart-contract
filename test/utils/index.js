import { expect } from 'chai';
import { ethers } from 'hardhat';

async function deploy(contractName, args, lib) {
  const Contract = await ethers.getContractFactory(contractName, lib);
  if (args?.length) {
    const contract = await Contract.deploy(...args);
    await contract.deployed();
    return contract;
  }
  const contract = await Contract.deploy();
  await contract.deployed();
  return contract;
}

async function submitWithReverted(contract, signer, admin, functionSignature, r, s, v, method, args, message) {
  // check reverted message if submit by admin directly
  await expect(contract.connect(admin)[method](...args)).to.be.revertedWith(message);

  // check reverted message if submit by meta transaction
  await expect(contract.connect(signer).executeMetaTransaction(admin.address, functionSignature, r, s, v)).to.be
    .reverted;
}

module.exports = {
  deploy,
  submitWithReverted,
};
