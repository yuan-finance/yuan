var fs = require('fs')

// ============ Contracts ============


// Protocol
const YUANProxy = artifacts.require("YUANDelegator");

// deployed third
const YUANReserves = artifacts.require("YUANReserves");
const YUANRebaser = artifacts.require("YUANRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");


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
  let yReserves = await YUANReserves.deployed()
  let yRebaser = await YUANRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();


  await Promise.all([
    YUAN._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        YUANProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        YUANReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        YUANRebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();

}
