// node scripts/ethers/signTx.js withdraw 10000000000000000000 0xa65c1619ae3116953Fdbc9003Eafc2b83c302c3f 624d6924ca81ad87ee118b4a

require('dotenv').config();
const fs = require('fs');
const ethers = require('ethers');
const TOKEN_FACTORY = JSON.parse(
  fs.readFileSync('deployments/bscTest/TokenFactory.json')
);
const { buildTransaction } = require('../../lib/buildTransaction');

const {
  utils: { hexZeroPad },
  Wallet,
  providers: { JsonRpcProvider },
  Contract,
} = ethers;

const RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const main = async () => {
  const provider = new JsonRpcProvider(RPC);
  const adminWallet = new Wallet(process.env.BACKEND_PRIVATE_KEY, provider);
  const user = new Wallet(process.env.USER_PRIVATE_KEY, provider);
  const factory = new Contract(TOKEN_FACTORY.address, TOKEN_FACTORY.abi, user);
  const blockNumber = await provider.getBlockNumber();
  const expirationBlock = blockNumber + 100;

  const flags = process.argv.slice(2);
  console.log('flags', flags);

  if (flags[0] === 'withdraw') {
    if (flags.length !== 4) {
      return console.error('Invalid number of arguments');
    }
    const quantity = flags[1];
    const receiver = flags[2];
    const transactionId = flags[3];
    console.log('quantity', quantity);
    console.log('receiver', receiver);
    console.log('transactionId', transactionId);
    console.log('expectedSender', user.address);
    console.log('expirationBlock', expirationBlock);

    const { adminAddress, functionSignature, r, s, v } = await buildTransaction(
      factory,
      'withdraw',
      [quantity, receiver, expirationBlock, transactionId],
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
  }
};

main();
