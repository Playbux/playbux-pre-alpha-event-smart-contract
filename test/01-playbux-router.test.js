import { ethers } from 'hardhat';

const {
  utils: { parseEther },
  constants: { MaxUint256 },
} = ethers;

let tx;

describe('PlaybuxRouter', async function () {
  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    this.deployer = accounts[0];
    const c = await ethers.getContractFactory('PlaybuxRouter');
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

  describe('Swap', async function () {
    it('should swap token correctly', async function () {
      const amountIn = ethers.utils.parseEther('18000');
      const amountOutMin = ethers.utils.parseEther('0.1');
      const paths = [this.busd.address, this.brk.address];
      const to = this.deployer.address;
      const deadline = await ethers.provider
        .getBlock('latest')
        .then((b) => b.timestamp + 3600);
      console.log(amountIn, amountOutMin, paths, to, deadline);
      const balance = await this.busd.balanceOf(this.deployer.address);
      console.log('balance', balance);
      tx = await this.router.swap(amountIn, amountOutMin, paths, to, deadline);
    });
  });
});
