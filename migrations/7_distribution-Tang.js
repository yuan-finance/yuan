var fs = require('fs')

// ============ Contracts ============


// Protocol
const YUANProxy = artifacts.require("YUANDelegator");

const Timelock = artifacts.require("Timelock");

const YUAN_ETHDFPool = artifacts.require("YUANETHDFPool");
const YUAN_ETHYFIPool = artifacts.require("YUANETHYFIPool");
const YUAN_ETHUNIPPool = artifacts.require("YUANETHUNIPool");
const YUAN_ETHYFIIPool = artifacts.require("YUANETHYFIIPool");
const YUAN_ETHLINKPool = artifacts.require("YUANETHLINKPool");
const YUAN_ETHBANDPool = artifacts.require("YUANETHBANDPool");

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

    await deployer.deploy(YUAN_ETHDFPool);
    await deployer.deploy(YUAN_ETHYFIPool);
    await deployer.deploy(YUAN_ETHUNIPPool);
    await deployer.deploy(YUAN_ETHYFIIPool);
    await deployer.deploy(YUAN_ETHLINKPool);
    await deployer.deploy(YUAN_ETHBANDPool);

    let eth_df_pool = new web3.eth.Contract(YUAN_ETHDFPool.abi, YUAN_ETHDFPool.address);
    let eth_yfi_pool = new web3.eth.Contract(YUAN_ETHYFIPool.abi, YUAN_ETHYFIPool.address);
    let eth_uni_pool = new web3.eth.Contract(YUAN_ETHUNIPPool.abi, YUAN_ETHUNIPPool.address);
    let eth_yfii_pool = new web3.eth.Contract(YUAN_ETHYFIIPool.abi, YUAN_ETHYFIIPool.address);
    let eth_link_pool = new web3.eth.Contract(YUAN_ETHLINKPool.abi, YUAN_ETHLINKPool.address);
    let eth_band_pool = new web3.eth.Contract(YUAN_ETHBANDPool.abi, YUAN_ETHBANDPool.address);

    console.log("setting distributor");
    await Promise.all([

      eth_df_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      eth_yfi_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      eth_uni_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      eth_yfii_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      eth_link_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      eth_band_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
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
      YUAN.transfer(YUAN_ETHDFPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHYFIPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHUNIPPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHYFIIPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHLINKPool.address, twenty.toString()),
      YUAN.transfer(YUAN_ETHBANDPool.address, twenty.toString()),
    ]);

    await Promise.all([
      eth_df_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_yfi_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_uni_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_yfii_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_link_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),
      eth_band_pool.methods.notifyRewardAmount(twenty.toString()).send({from:accounts[0]}),

    ]);

    await Promise.all([

      eth_df_pool.methods.setRewardDistribution(Timelock.address).send({ from: accounts[0], gas: 100000 }),
      eth_yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_uni_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_yfii_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_link_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_band_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
    await Promise.all([

      eth_df_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_yfi_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_uni_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_yfii_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_link_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      eth_band_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
  }

  console.log("ETHDF contract:     ", YUAN_ETHDFPool.address)
  console.log("ETHYFI contract:    ", YUAN_ETHYFIPool.address)
  console.log("ETHUNI contract:    ", YUAN_ETHUNIPPool.address)
  console.log("ETHYFII contract:   ", YUAN_ETHYFIIPool.address)
  console.log("ETHLINK contract:   ", YUAN_ETHLINKPool.address)
  console.log("ETHBAND contract:   ", YUAN_ETHBANDPool.address,"\n")
}
