import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-solhint';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'dotenv/config';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import { removeConsoleLog } from 'hardhat-preprocessor';
import 'hardhat-spdx-license-identifier';
import 'solidity-coverage';

// const mnemonicTest = 'guilt nation burst armed glad race cloth glue lumber kitchen echo electric captain arctic puppy';

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

module.exports = {
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      saveDeployments: true,
      tags: ['ropsten'],
      accounts,
    },
    bscTest: {
      url: 'https://bsctestapi.terminet.io/rpc',
      saveDeployments: true,
      tags: ['bscTest'],
      accounts,
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org/',
      saveDeployments: true,
      tags: ['bsc'],
      accounts,
    },
    hardhat: {
      // forking: {
      //   url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      // },
      // blockNumber: '20416384',
      // accounts: {
      //   mnemonic: mnemonicTest,
      // },
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.14',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  mocha: {
    timeout: 180e3,
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  preprocess: {
    eachLine: removeConsoleLog((hre) => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'),
  },
  etherscan: {
    apiKey: process.env.API_KEY,
  },
};
