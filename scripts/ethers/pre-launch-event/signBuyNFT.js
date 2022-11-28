// node scripts/ethers/pre-launch-event/signBuyNFT.js <amount> <type> <receiver>
// node scripts/ethers/pre-launch-event/signBuyNFT.js 1 10 0xa65c1619ae3116953Fdbc9003Eafc2b83c302c3f

require('dotenv').config();
const fs = require('fs');
const ethers = require('ethers');
const NFT_FACTORY = JSON.parse(fs.readFileSync('deployments/bscTest/NFTFactory.json'));
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
  const adminWallet = new Wallet(process.env.BACKEND_PRIVATE_KEY_BUY_NFT, provider);
  const user = new Wallet(process.env.USER_PRIVATE_KEY, provider);
  const factory = new Contract(NFT_FACTORY.address, NFT_FACTORY.abi, user);
  const blockNumber = await provider.getBlockNumber();
  const expirationBlock = blockNumber + 100;

  const flags = process.argv.slice(2);
  console.log('flags', flags);

  if (flags.length !== 3) {
    return console.error('Invalid number of arguments');
  }
  const amount = flags[0];
  const type = flags[1];
  const receiver = flags[2];
  const transactionId = randomTxId();
  console.log('amount', amount);
  console.log('type', type);
  console.log('receiver', receiver);
  console.log('transactionId', transactionId);
  console.log('expectedSender', user.address);
  console.log('expirationBlock', expirationBlock);

  const { adminAddress, functionSignature, r, s, v } = await buildTransaction(
    factory,
    'mint',
    [transactionId, expirationBlock, receiver, amount, type],
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
