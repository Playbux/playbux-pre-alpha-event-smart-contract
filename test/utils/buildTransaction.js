import { ethers } from 'hardhat';

const {
  utils: { hexlify, splitSignature, randomBytes },
  provider,
} = ethers;

const metaTransactionType = [
  {
    name: 'nonce',
    type: 'uint256',
  },
  {
    name: 'from',
    type: 'address',
  },
  {
    name: 'functionSignature',
    type: 'bytes',
  },
];

async function buildTransaction(contract, method, args, adminWallet, expectedSender) {
  const name = await contract.name();
  const nonce = await contract.getNonce(expectedSender.address);
  const version = await contract.ERC712_VERSION();
  const chainId = await contract.getChainId();
  const domain = {
    name: name,
    version: version,
    verifyingContract: contract.address,
    salt: '0x' + hexlify(chainId).substring(2).padStart(64, '0'),
  };
  const types = {
    MetaTransaction: metaTransactionType,
  };
  const Interface = contract.interface;
  const functionSignature = await Interface.encodeFunctionData(method, args);
  const values = {
    nonce: parseInt(nonce),
    from: await adminWallet.getAddress(),
    functionSignature,
  };
  const signed = await adminWallet._signTypedData(domain, types, values);
  const splitted = splitSignature(signed);

  const transactionId = hexlify(randomBytes(12));
  const blockNumber = await provider.getBlockNumber();
  const expirationBlock = blockNumber + 100;

  return {
    adminAddress: adminWallet.address,
    functionSignature,
    r: splitted.r,
    s: splitted.s,
    v: splitted.v,
    transactionId,
    expirationBlock,
  };
}

async function getParameters() {
  const transactionId = hexlify(randomBytes(12));
  const blockNumber = await provider.getBlockNumber();
  const expirationBlock = blockNumber + 100;
  return {
    transactionId,
    expirationBlock,
  };
}

module.exports = {
  buildTransaction,
  getParameters,
};
