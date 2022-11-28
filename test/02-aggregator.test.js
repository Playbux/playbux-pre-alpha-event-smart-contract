import { ethers } from 'hardhat';

const {
  utils: { parseEther, defaultAbiCoder, AbiCoder, Interface },
  constants: { MaxUint256, HashZero },
} = ethers;

let tx;

describe('Aggregator', async function () {
  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    this.deployer = accounts[0];
    const c = await ethers.getContractFactory('Aggregator');
    this.bakeryRouter = '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F';

    this.busd = await ethers.getContractFactory('MockBUSD');
    this.busd = await this.busd.deploy();
    this.brk = await ethers.getContractFactory('BRK');
    this.brk = await this.brk.deploy();
    this.pbux = await ethers.getContractFactory('PBUX');
    this.pbux = await this.pbux.deploy();
    this.router = await c.deploy(this.bakeryRouter);
    this.router = await this.router.deployed();

    tx = await this.router.approveToken(this.busd.address, MaxUint256);
    console.log('ApproveToken', tx.hash);
    tx = await this.router.approveToken(this.brk.address, MaxUint256);
    console.log('ApproveToken', tx.hash);
    tx = await this.router.approveToken(this.pbux.address, MaxUint256);
    console.log('ApproveToken', tx.hash);

    tx = await this.busd.approve(this.router.address, MaxUint256);
    console.log('Approve', tx.hash);
    tx = await this.brk.approve(this.router.address, MaxUint256);
    console.log('Approve', tx.hash);
    tx = await this.pbux.approve(this.router.address, MaxUint256);
    console.log('Approve', tx.hash);

    this.ISwapRouter = await ethers.getContractAt(
      'ISwapRouter',
      this.bakeryRouter
    );

    tx = await this.busd.approve(this.bakeryRouter, MaxUint256);
    console.log('Approve', tx.hash);
    tx = await this.brk.approve(this.bakeryRouter, MaxUint256);
    console.log('Approve', tx.hash);
    tx = await this.pbux.approve(this.bakeryRouter, MaxUint256);
    console.log('Approve', tx.hash);

    tx = await this.ISwapRouter.addLiquidity(
      this.busd.address,
      this.brk.address,
      parseEther('1000000'),
      parseEther('10000000'),
      0,
      0,
      this.deployer.address,
      '1755798532'
    );
    console.log('AddLiquidity', tx.hash);
  });

  describe('Swap1inch', async function () {
    it('should swap token correctly', async function () {
      const caller = this.deployer.address;
      const desc = {};
      desc.srcToken = this.busd.address;
      desc.dstToken = this.brk.address;
      desc.srcReceiver = '0x9c4350F527ff7f96b650ee894AE9103BDFec0432'; // address of LP that includes tokens
      desc.dstReceiver = '0x795d64E1585DeF2b83784e7f55129Ae86C6eD416';
      desc.amount = parseEther('18000');
      desc.minReturnAmount = parseEther('0.1');
      desc.flags = '0';
      desc.permit = HashZero;
      const data = HashZero;

      const abiCoder = defaultAbiCoder;
      const encodedData = abiCoder.encode(
        [
          'address',
          'address',
          'address',
          'address',
          'uint256',
          'uint256',
          'uint256',
          'bytes',
        ],
        [
          this.busd.address,
          this.brk.address,
          desc.srcReceiver,
          desc.dstReceiver,
          desc.amount,
          desc.minReturnAmount,
          desc.flags,
          desc.permit,
        ]
      );

      console.log(
        this.busd.address,
        this.brk.address,
        desc.srcReceiver,
        desc.dstReceiver,
        desc.amount,
        desc.minReturnAmount,
        desc.flags,
        desc.permit
      );

      console.log('encodedData', encodedData);

      tx = await this.router.swap(caller, desc, data);
    });
  });
});
