var fs = require('fs')

// ============ Contracts ============


// Protocol
const YUANProxy = artifacts.require("YUANDelegator");

const Timelock = artifacts.require("Timelock");

// deployed fourth
const YUAN_USDxUSDCPool = artifacts.require("YUANUSDxUSDCPool");
const YUAN_USDxYUANPool = artifacts.require("YUANUSDxYUANPool");
const YUAN_ETHYUANPool = artifacts.require("YUANETHYUANPool");

const YUAN_ETHYAMPool = artifacts.require("YUANETHYAMPool");
const YUAN_ETHAMPLPool = artifacts.require("YUANETHAMPLPool");


// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployDistribution(deployer, network, accounts),
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let YUAN = await YUANProxy.deployed();
  let tl = await Timelock.deployed();



  if (network != "test") {
    await deployer.deploy(YUAN_USDxUSDCPool);
    await deployer.deploy(YUAN_USDxYUANPool);
    await deployer.deploy(YUAN_ETHYUANPool);

    await deployer.deploy(YUAN_ETHYAMPool);
    await deployer.deploy(YUAN_ETHAMPLPool);

    let usdx_usdc_pool = new web3.eth.Contract(YUAN_USDxUSDCPool.abi, YUAN_USDxUSDCPool.address);
    let usdx_yuan_pool = new web3.eth.Contract(YUAN_USDxYUANPool.abi, YUAN_USDxYUANPool.address);
    let eth_yuan_pool = new web3.eth.Contract(YUAN_ETHYUANPool.abi, YUAN_ETHYUANPool.address);

    let eth_yam_pool = new web3.eth.Contract(YUAN_ETHYAMPool.abi, YUAN_ETHYAMPool.address);
    let eth_ampl_pool = new web3.eth.Contract(YUAN_ETHAMPLPool.abi, YUAN_ETHAMPLPool.address);

    console.log("setting distributor");
    await Promise.all([

      usdx_usdc_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      usdx_yuan_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      eth_yuan_pool.methods.setRewardDistribution(accounts[0]).send({ from: accounts[0], gas: 100000 }),

      eth_yam_pool.methods.setRewardDistribution(accounts[0]).send({ from: accounts[0], gas: 100000 }),
      eth_ampl_pool.methods.setRewardDistribution(accounts[0]).send({ from: accounts[0], gas: 100000 }),

      ]);

    // usdx-usdc: 600,000
    let six_hundred = web3.utils.toBN(10 ** 3).mul(web3.utils.toBN(10 ** 18)).mul(web3.utils.toBN(600));
    // yuan-eth: 200,000
    let two_hundred = web3.utils.toBN(10 ** 3).mul(web3.utils.toBN(10 ** 18)).mul(web3.utils.toBN(200));
    // usdx-yuan:1,200,000
    let one_thousand_two_hundred = web3.utils.toBN(10 ** 3).mul(web3.utils.toBN(10 ** 18)).mul(web3.utils.toBN(1200));
    // usdc-eth, dai-eth, usdt-eth, usdx-eth, yam-eth, ampl-eth, uni-eth, yfi-eth,
    // df-eth, yfi-eth, link-eth, band-eth: 20,000
    let twenty = web3.utils.toBN(10 ** 3).mul(web3.utils.toBN(10 ** 18)).mul(web3.utils.toBN(20));
    // incentive yuan-usdx: 40w * 30% => 120,000
    let one_hundred_twenty = web3.utils.toBN(10 ** 3).mul(web3.utils.toBN(10 ** 18)).mul(web3.utils.toBN(120));
    // incentive yuan-eth: 40w * 70% => 280,000
    let two_hundred_eighty = web3.utils.toBN(10 ** 3).mul(web3.utils.toBN(10 ** 18)).mul(web3.utils.toBN(280));

    console.log("transfering and notifying");
    // console.log("eth");
    await Promise.all([
      YUAN.transfer(YUAN_USDxUSDCPool.address, six_hundred.toString()),
      YUAN.transfer(YUAN_ETHYUANPool.address, two_hundred.toString()),
      YUAN.transfer(YUAN_USDxYUANPool.address, one_thousand_two_hundred.toString()),

      YUAN.transfer(YUAN_ETHYAMPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHAMPLPool.address, twenty.toString()),

    ]);

    await Promise.all([
      usdx_usdc_pool.methods.notifyRewardAmount(six_hundred.toString()).send({from:accounts[0]}),
      eth_yuan_pool.methods.notifyRewardAmount(two_hundred.toString()).send({ from: accounts[0] }),
      usdx_yuan_pool.methods.notifyRewardAmount(one_thousand_two_hundred.toString()).send({from:accounts[0]}),

      eth_yam_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_ampl_pool.methods.notifyRewardAmount(twenty.toString()).send({ from: accounts[0]}),

    ]);

    await Promise.all([
      usdx_usdc_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_yuan_pool.methods.setRewardDistribution(Timelock.address).send({ from: accounts[0], gas: 100000 }),
      usdx_yuan_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),

      eth_yam_pool.methods.setRewardDistribution(Timelock.address).send({ from: accounts[0], gas: 100000 }),
      eth_ampl_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),

      ]);
    await Promise.all([

      usdx_usdc_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_yuan_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      usdx_yuan_pool.methods.transferOwnership(Timelock.address).send({ from: accounts[0], gas: 100000 }),

      eth_yam_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_ampl_pool.methods.transferOwnership(Timelock.address).send({ from: accounts[0], gas: 100000 }),

     ]);
  }

  console.log("USDxUSDC contract:  ", YUAN_USDxUSDCPool.address)
  console.log("ETHYUAN contract:   ", YUAN_ETHYUANPool.address)
  console.log("USDxYUAN contract:  ", YUAN_USDxYUANPool.address,"\n")

  console.log("ETHYAM contract:    ", YUAN_ETHYAMPool.address)
  console.log("ETHAMPL contract:   ", YUAN_ETHAMPLPool.address,"\n")

}
