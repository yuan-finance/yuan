// ============ Contracts ============

// Token
// deployed first
const YUANImplementation = artifacts.require("YUANDelegate");
const YUANProxy = artifacts.require("YUANDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([deployToken(deployer, network)]);
};

module.exports = migration;

// ============ Deploy Functions ============

async function deployToken(deployer, network) {
  await deployer.deploy(YUANImplementation);
  if (network != "mainnet") {
    await deployer.deploy(
      YUANProxy,
      "YUAN",
      "YUAN",
      18,
      "9000000000000000000000000", // print extra few mil for user
      YUANImplementation.address,
      "0x"
    );
  } else {
    await deployer.deploy(
      YUANProxy,
      "YUAN",
      "YUAN",
      18,
      "2000000000000000000000000",
      YUANImplementation.address,
      "0x"
    );
  }
}
