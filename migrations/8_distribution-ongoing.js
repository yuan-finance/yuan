var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed helper
const APY = artifacts.require("CalculateApy");
// deployed second
const YUANProxy = artifacts.require("YUANDelegator");

const Timelock = artifacts.require("Timelock");



// deployed fifth
const YUAN_ETHIncentivizer = artifacts.require("YUANETHIncentivizer");
const YUAN_USDxIncentivizer = artifacts.require("YUANUSDxIncentivizer");
const Reward_Distributor = artifacts.require("RewardDistributor");

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
  let tl = await Timelock.deployed();
  let YUAN = await YUANProxy.deployed();

  if (network != "test") {
    // deploy apy contract
    await deployer.deploy(APY, YUAN.address);

    await deployer.deploy(YUAN_ETHIncentivizer, YUAN.address);
    await deployer.deploy(YUAN_USDxIncentivizer, YUAN.address);
    await deployer.deploy(Reward_Distributor, YUAN.address);

    let yuanApy = new web3.eth.Contract(APY.abi, APY.address);
    let reserveToken = "0xeb269732ab75A6fD61Ea60b06fE994cD32a83549";
    let weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    // set swap route
    let stableSwapPath = [YUAN.address, reserveToken];
    let ethSwapPath = [weth, reserveToken];

    let incentive_distribution = new web3.eth.Contract(Reward_Distributor.abi, Reward_Distributor.address);
    let yaun_eth_pool = new web3.eth.Contract(YUAN_ETHIncentivizer.abi, YUAN_ETHIncentivizer.address);
    let yaun_usdx_pool = new web3.eth.Contract(YUAN_USDxIncentivizer.abi, YUAN_USDxIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
      // APY config
      yuanApy.methods.setYuanAddress(YUAN.address).send({ from: accounts[0]}),
      yuanApy.methods.setPoolPath(stableSwapPath).send({ from: accounts[0]}),
      yuanApy.methods.setPoolPath(ethSwapPath).send({ from: accounts[0]}),

      yaun_eth_pool.methods.setRewardDistribution(Reward_Distributor.address).send({ from: accounts[0], gas: 100000}),
      yaun_usdx_pool.methods.setRewardDistribution(Reward_Distributor.address).send({from: accounts[0], gas: 100000}),

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
      // incentives is a minter and prepopulates itself.
      incentive_distribution.methods.addRecipientAndSetReward(
        YUAN_ETHIncentivizer.address,
        one_hundred_twenty.toString(),
        60*60*24*365
      ).send({ from: accounts[0]}),
      incentive_distribution.methods.addRecipientAndSetReward(
        YUAN_USDxIncentivizer.address,
        two_hundred_eighty.toString(),
        60*60*24*365
      ).send({ from: accounts[0]}),
    ]);


    await Promise.all([
      yaun_eth_pool.methods.transferOwnership(Timelock.address).send({ from: accounts[0], gas: 100000 }),
      yaun_usdx_pool.methods.transferOwnership(Timelock.address).send({ from: accounts[0], gas: 100000 }),
      incentive_distribution.methods.transferOwnership(Timelock.address).send({ from: accounts[0], gas: 100000 }),
    ]);
  }

  console.log("Calculate APY is:   ", APY.address,"\n")

  console.log("YUAN ETH Pool:      ", YUAN_ETHIncentivizer.address)
  console.log("YUAN USDx Pool:     ", YUAN_USDxIncentivizer.address)
  console.log("Reward Distributor: ", Reward_Distributor.address,"\n")
}
