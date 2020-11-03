// ============ Contracts ============

// Token
// deployed first
const YUANProxy = artifacts.require("YUANDelegator");
const Oracle = artifacts.require("PriceOracle");

// Rs
// deployed second
const YUANReserves = artifacts.require("YUANReserves");
const YUANRebaser = artifacts.require("YUANRebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0xeb269732ab75A6fD61Ea60b06fE994cD32a83549";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let yuan = await YUANProxy.deployed();

  await deployer.deploy(Oracle, '0x6e8e3697Ff41d021D4D7a988c3CDF504cd6BD26f', "50000000000000000")
  await deployer.deploy(YUANReserves, reserveToken, YUANProxy.address);
  await deployer.deploy(YUANRebaser,
      YUANProxy.address,
      reserveToken,
      uniswap_factory,
      [YUANReserves.address, '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
      "0x0000000000000000000000000000000000000000",
      0,
      Oracle.address
  );

  let rebase = new web3.eth.Contract(YUANRebaser.abi, YUANRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log("uniswap pair is: ", pair)

  await yuan._setRebaser(YUANRebaser.address);
  let reserves = await YUANReserves.deployed();
  await reserves._setRebaser(YUANRebaser.address)
}
