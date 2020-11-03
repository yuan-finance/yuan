var fs = require('fs')

// ============ Contracts ============


// Protocol
const YUANProxy = artifacts.require("YUANDelegator");
const Timelock = artifacts.require("Timelock");


const YUAN_ETHUSDCPool = artifacts.require("YUANETHUSDCPool");
const YUAN_ETHDAIPool = artifacts.require("YUANETHDAIPool");
const YUAN_ETHUSDTPool = artifacts.require("YUANETHUSDTPool");
const YUAN_ETHUSDxPool = artifacts.require("YUANETHUSDxPool");


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

    await deployer.deploy(YUAN_ETHUSDCPool);
    await deployer.deploy(YUAN_ETHDAIPool);
    await deployer.deploy(YUAN_ETHUSDTPool);
    await deployer.deploy(YUAN_ETHUSDxPool);

    let eth_usdc_pool = new web3.eth.Contract(YUAN_ETHUSDCPool.abi, YUAN_ETHUSDCPool.address);
    let eth_dai_pool = new web3.eth.Contract(YUAN_ETHDAIPool.abi, YUAN_ETHDAIPool.address);
    let eth_usdt_pool = new web3.eth.Contract(YUAN_ETHUSDTPool.abi, YUAN_ETHUSDTPool.address);
    let eth_usdx_pool = new web3.eth.Contract(YUAN_ETHUSDxPool.abi, YUAN_ETHUSDxPool.address);

    console.log("setting distributor");
    await Promise.all([

      eth_usdc_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0]}),
      eth_dai_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0]}),
      eth_usdt_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0]}),
      eth_usdx_pool.methods.setRewardDistribution(accounts[0]).send({ from: accounts[0] }),
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
    await Promise.all([

      YUAN.transfer(YUAN_ETHUSDCPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHDAIPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHUSDTPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHUSDxPool.address, twenty.toString()),

    ]);

    await Promise.all([

      eth_usdc_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_dai_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_usdt_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_usdx_pool.methods.notifyRewardAmount(twenty.toString()).send({ from: accounts[0] }),

    ]);

    await Promise.all([

      eth_usdc_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_dai_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_usdt_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_usdx_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),

      ]);
    await Promise.all([

      eth_usdc_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_dai_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_usdt_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_usdx_pool.methods.transferOwnership(Timelock.address).send({ from: accounts[0], gas: 100000 }),

      ]);
  }

  console.log("ETHUSDC contract:   ", YUAN_ETHUSDCPool.address)
  console.log("ETHDAI contract:    ", YUAN_ETHDAIPool.address)
  console.log("ETHUSDT contract:   ", YUAN_ETHUSDTPool.address)
  console.log("ETHUSDx contract:   ", YUAN_ETHUSDxPool.address,"\n")
}
