// node scripts/ethers/pre-launch-event/signCompoundNFT.js <type> <receiver> <tokenIds>
// node scripts/ethers/pre-launch-event/signCompoundNFT.js 999 0x8A6544015464c7C5f1a8A5edA95AfDC7cBc1BeC3 11000000000000000001,11000000000000000002,11000000000000000003,11000000000000000004,11000000000000000005

require('dotenv').config();
const fs = require('fs');
const ethers = require('ethers');
const NFT_FACTORY = JSON.parse(fs.readFileSync('deployments/bscTest/NFTCompound.json'));
const { buildTransaction } = require('../../../lib/buildTransaction');

const {
  utils: { hexZeroPad },
  Wallet,
  providers: { JsonRpcProvider },
  Contract,
} = ethers;

const RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const main = async () => {
  const provider = new JsonRpcProvider(RPC);
  const adminWallet = new Wallet(process.env.BACKEND_PRIVATE_KEY_COMPOUND_NFT, provider);
  const user = new Wallet(process.env.USER_PRIVATE_KEY, provider);
  const factory = new Contract(NFT_FACTORY.address, NFT_FACTORY.abi, user);
  const blockNumber = await provider.getBlockNumber();
  const expirationBlock = blockNumber + 100;

  const flags = process.argv.slice(2);
  console.log('flags', flags);

  if (flags.length !== 3) {
    return console.error('Invalid number of arguments');
  }
  const type = flags[0];
  const receiver = flags[1];
  const tokenIds = flags[2].split(',');
  const transactionId = randomTxId();
  console.log('type', type);
  console.log('receiver', receiver);
  console.log('transactionId', transactionId);
  console.log('expectedSender', user.address);
  console.log('expirationBlock', expirationBlock);

  const { adminAddress, functionSignature, r, s, v } = await buildTransaction(
    factory,
    'compound',
    [transactionId, expirationBlock, receiver, type, tokenIds],
    adminWallet,
    user
  );

  console.log('adminAddress', adminAddress);
  console.log('functionSignature', functionSignature);
  console.log('r', r);
  console.log('s', s);
  console.log('v', v);

  // const tx = await factory
  //   .connect(user)
  //   .executeMetaTransaction(adminAddress, functionSignature, r, s, v);
};

randomTxId = () => {
  return hexZeroPad(ethers.utils.hexlify(ethers.utils.randomBytes(32)), 32);
};

main();
