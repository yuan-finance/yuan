var fs = require("fs");

// ============ Contracts ============

// Protocol
// deployed second
const YUANImplementation = artifacts.require("YUANDelegate");
const YUANProxy = artifacts.require("YUANDelegator");

// deployed third
const YUANReserves = artifacts.require("YUANReserves");
const YUANRebaser = artifacts.require("YUANRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const YUAN_ETHPool = artifacts.require("YUANETHPool");
const YUAN_uAMPLPool = artifacts.require("YUANAMPLPool");
const YUAN_YFIPool = artifacts.require("YUANYFIPool");
const YUAN_LINKPool = artifacts.require("YUANLINKPool");
const YUAN_MKRPool = artifacts.require("YUANMKRPool");
const YUAN_LENDPool = artifacts.require("YUANLENDPool");
const YUAN_COMPPool = artifacts.require("YUANCOMPPool");
const YUAN_SNXPool = artifacts.require("YUANSNXPool");

// deployed fifth
const YUANIncentivizer = artifacts.require("YUANIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============

async function deployDistribution(deployer, network, accounts) {
  console.log(network);
  let yuan = await YUANProxy.deployed();
  let yReserves = await YUANReserves.deployed();
  let yRebaser = await YUANRebaser.deployed();
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(YUAN_ETHPool);
    await deployer.deploy(YUAN_uAMPLPool);
    await deployer.deploy(YUAN_YFIPool);
    await deployer.deploy(YUANIncentivizer);
    await deployer.deploy(YUAN_LINKPool);
    await deployer.deploy(YUAN_MKRPool);
    await deployer.deploy(YUAN_LENDPool);
    await deployer.deploy(YUAN_COMPPool);
    await deployer.deploy(YUAN_SNXPool);

    let eth_pool = new web3.eth.Contract(
      YUAN_ETHPool.abi,
      YUAN_ETHPool.address
    );
    let ampl_pool = new web3.eth.Contract(
      YUAN_uAMPLPool.abi,
      YUAN_uAMPLPool.address
    );
    let yfi_pool = new web3.eth.Contract(
      YUAN_YFIPool.abi,
      YUAN_YFIPool.address
    );
    let lend_pool = new web3.eth.Contract(
      YUAN_LENDPool.abi,
      YUAN_LENDPool.address
    );
    let mkr_pool = new web3.eth.Contract(
      YUAN_MKRPool.abi,
      YUAN_MKRPool.address
    );
    let snx_pool = new web3.eth.Contract(
      YUAN_SNXPool.abi,
      YUAN_SNXPool.address
    );
    let comp_pool = new web3.eth.Contract(
      YUAN_COMPPool.abi,
      YUAN_COMPPool.address
    );
    let link_pool = new web3.eth.Contract(
      YUAN_LINKPool.abi,
      YUAN_LINKPool.address
    );
    let ycrv_pool = new web3.eth.Contract(
      YUANIncentivizer.abi,
      YUANIncentivizer.address
    );

    console.log("setting distributor");
    await Promise.all([
      eth_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      ampl_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      yfi_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      ycrv_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      lend_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      mkr_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      snx_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      comp_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      link_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
      ycrv_pool.methods
        .setRewardDistribution(accounts[0])
        .send({ from: accounts[0], gas: 100000 }),
    ]);

    let two_fifty = web3.utils
      .toBN(10 ** 3)
      .mul(web3.utils.toBN(10 ** 18))
      .mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      yuan.transfer(YUAN_ETHPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_uAMPLPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_YFIPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_LENDPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_MKRPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_SNXPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_COMPPool.address, two_fifty.toString()),
      yuan.transfer(YUAN_LINKPool.address, two_fifty.toString()),
      yuan._setIncentivizer(YUANIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      ampl_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      yfi_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      lend_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      mkr_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      snx_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      comp_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),
      link_pool.methods
        .notifyRewardAmount(two_fifty.toString())
        .send({ from: accounts[0] }),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods
        .notifyRewardAmount("0")
        .send({ from: accounts[0], gas: 500000 }),
    ]);

    await Promise.all([
      eth_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      ampl_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      yfi_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      lend_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      mkr_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      snx_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      comp_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      link_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      ycrv_pool.methods
        .setRewardDistribution(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
    ]);
    await Promise.all([
      eth_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      ampl_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      yfi_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      lend_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      mkr_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      snx_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      comp_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      link_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
      ycrv_pool.methods
        .transferOwnership(Timelock.address)
        .send({ from: accounts[0], gas: 100000 }),
    ]);
  }

  await Promise.all([
    yuan._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
    tl.executeTransaction(YUANProxy.address, 0, "_acceptGov()", "0x", 0),

    tl.executeTransaction(YUANReserves.address, 0, "_acceptGov()", "0x", 0),

    tl.executeTransaction(YUANRebaser.address, 0, "_acceptGov()", "0x", 0),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
