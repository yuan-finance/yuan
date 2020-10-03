// ============ Contracts ============

// Token
// deployed first
const YUANImplementation = artifacts.require("YUANDelegate");
const YUANProxy = artifacts.require("YUANDelegator");

// Rs
// deployed second
const YUANReserves = artifacts.require("YUANReserves");
const YUANRebaser = artifacts.require("YUANRebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([deployRs(deployer, network)]);
};

module.exports = migration;

// ============ Deploy Functions ============

async function deployRs(deployer, network) {
  let reserveToken = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(YUANReserves, reserveToken, YUANProxy.address);
  await deployer.deploy(
    YUANRebaser,
    YUANProxy.address,
    reserveToken,
    uniswap_factory,
    YUANReserves.address
  );
  let rebase = new web3.eth.Contract(YUANRebaser.abi, YUANRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log(pair);
  let YUAN = await YUANProxy.deployed();
  await YUAN._setRebaser(YUANRebaser.address);
  let reserves = await YUANReserves.deployed();
  await reserves._setRebaser(YUANRebaser.address);
}
