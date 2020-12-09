// YIP004 - replace reserve contract

const { expect } = require("chai");
const BN = require("bn.js");
const { ethers } = require("hardhat");

const UINT256_MAX = ethers.utils.parseUnits(
  new BN(2).pow(new BN(256)).sub(new BN(1)).toString(),
  "wei"
);

const watcher = "0x96bbcA3eECeCC6FED133b2FB7723D79AC539f816";
const newGovernanceAddress = "0x6D5556b3CbD13375FAa08831588005900A966c60";

const timelockAddress = "0xbC2015a541E30C9c352ee2F2f9E90E5219b298e2";

const yuanAddress = "0x4A3e164684812DfB684AC36457E7fA805087c68E";
const proposer = "0x2152d5D4838bb4Cf6AEb2485289548aCAD0ebB3F";
//const proposer = "0x21a97a2151d8725ca79105B4fF38f0275E6034A5";

const rebaserAddress = "0x71a6Ad88AC18EB83D741E411f8938B33918D0125";
const oldReserveAddress = "0x7ba4e109c1dc8B52ed63D8EdF0e951685DDe4DA6";
// local contract
// const newReserveAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const newReserveAddress = "0xB37C599fbDD3f1C30fcAe51194ec802E52f70f61";

const usdxAddress = "0xeb269732ab75A6fD61Ea60b06fE994cD32a83549";

const fakeUser = "0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0";

var newGoverance,
  yuan,
  usdx,
  timelockContract,
  reserveV2,
  oldReserve,
  reserveV1;

async function impersonatedAccount(address) {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
}

async function stopImpersonatingAccount(address) {
  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [address],
  });
}

async function increaseBlock(blockNumber) {
  await hre.network.provider.request({
    method: "evm_mine",
    params: [],
  });
}

async function increaseTime(time) {
  await hre.network.provider.request({
    method: "evm_increaseTime",
    params: [time],
  });
}

async function getBlock() {
  return hre.network.provider.request({
    method: "eth_blockNumber",
    params: [],
  });
}

async function initContract() {
  newGoverance = await ethers.getContractAt(
    "GovernorAlphaV2",
    newGovernanceAddress
  );
  yuan = await ethers.getContractAt("YUANDelegator", yuanAddress);
  timelockContract = await ethers.getContractAt("Timelock", timelockAddress);
  //   oldReserve = await ethers.getContractAt("YUANReserves", oldReserveAddress);
  usdx = await ethers.getContractAt("YUANETHIncentivizer", usdxAddress);
  reserveV2 = await ethers.getContractAt("YUANReservesV2", newReserveAddress);
  reserveV1 = await ethers.getContractAt("YUANReserves", oldReserveAddress);

  // const newReserve = await ethers.getContractFactory("YUANReservesV2");
  // reserveV2 = await newReserve.deploy(usdxAddress, yuanAddress);
  // await reserveV2.deployed();

  // console.log("reserve address", reserveV2.address);

  // // set pending admin to TimeLock contract.
  // await reserveV2._setPendingGov(timelockAddress);
  // // set rebaser to original Rebaser contract.
  // await reserveV2._setRebaser(rebaserAddress);
}

async function checkBalance() {
  console.log("\n");

  console.log(
    "watcher  vote power is: ",
    (await yuan.getCurrentVotes(watcher)).toString()
  );
  console.log(
    "proposer vote power is: ",
    (await yuan.getCurrentVotes(proposer)).toString()
  );
}

describe("Replace the reserve contract and transfer part of reserve out", function () {
  before(async function () {
    await initContract();
  });

  it("here", async function () {
    console.log("hrere!!");
    // await impersonatedAccount(proposer);
    // var contractProposer = await ethers.provider.getSigner(proposer);
    // let oldReserveBalance = await reserveV1.reserves();
    // console.log("beofre transfer old reserve usdx balance", oldReserveBalance.toString());
    // await reserveV1.connect(contractProposer).migrateReserves(fakeUser, [usdxAddress]);
    // oldReserveBalance = await reserveV1.reserves();
    // console.log("after transfer old reserve usdx balance", oldReserveBalance.toString());
    // await stopImpersonatingAccount(proposer);
  });

  // YIP004 - replace reserve contract
  it("execute YIP004 proposal", async function () {
    await checkBalance();

    console.log(
      "current proposal is: ",
      (await newGoverance.proposalCount()).toString()
    );
    await impersonatedAccount(proposer);
    // a new proposal.
    var contractProposer = await ethers.provider.getSigner(proposer);

    await newGoverance
      .connect(contractProposer)
      .propose(
        [
          newReserveAddress,
          oldReserveAddress,
          rebaserAddress,
          newReserveAddress,
        ],
        ["0", "0", "0", "0"],
        [
          "_acceptGov()",
          "migrateReserves(address,address[])",
          "setReserveContract(uint256,address)",
          "oneTimeTransfers(address[],uint256[],address[])",
        ],
        [
          "0x",
          "0x000000000000000000000000B37C599fbDD3f1C30fcAe51194ec802E52f70f6100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000eb269732ab75a6fd61ea60b06fe994cd32a835490000000000000000000000004a3e164684812dfb684ac36457e7fa805087c68e",
          "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000B37C599fbDD3f1C30fcAe51194ec802E52f70f61",
          "0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000431ad2ff6a9c365805ebad47ee021148d6f7dbe0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000001b1ae4d6e2ef5000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eb269732ab75a6fd61ea60b06fe994cd32a83549",
        ],
        "replace reserve"
      );

    console.log("propose done");

    // start to vote.
    for (let i = 0; i < 10; i++) {
      await increaseBlock();
    }

    await newGoverance.connect(contractProposer).castVote("2", "true");
    console.log("cast done");

    // pass vote period
    for (let i = 0; i < 12545; i++) {
      await increaseBlock();
    }

    let proposalState = await newGoverance.state("2");
    console.log("proposal State is: ", proposalState);

    await newGoverance.connect(contractProposer).queue("2");

    proposalState = await newGoverance.state("2");
    console.log("proposal State is: ", proposalState);

    let oldReserveBalance = await reserveV1.reserves();
    console.log(
      "beofre transfer old reserve usdx balance",
      oldReserveBalance.toString()
    );
    let oldReserveYuanBalance = await yuan.balanceOf(oldReserveAddress);
    console.log(
      "beofre transfer old reserve yuan balance",
      oldReserveYuanBalance.toString()
    );
    let newReserveBalance = await usdx.balanceOf(newReserveAddress);
    console.log(
      "before transfer new reserve usdx balance",
      newReserveBalance.toString()
    );
    let newReserveYuanBalance = await yuan.balanceOf(newReserveAddress);
    console.log(
      "before transfer new reserve yuan balance",
      newReserveYuanBalance.toString()
    );
    let userBalance = await usdx.balanceOf(fakeUser);
    console.log("before transfer user balance", userBalance.toString());

    // increase time to execute proposal.
    await increaseTime(12 * 60 * 60);
    await newGoverance.connect(contractProposer).execute("2");

    proposalState = await newGoverance.state("2");
    console.log("proposal State is: ", proposalState);

    oldReserveBalance = await reserveV1.reserves();
    console.log(
      "after transfer old reserve usdx balance",
      oldReserveBalance.toString()
    );
    oldReserveYuanBalance = await yuan.balanceOf(oldReserveAddress);
    console.log(
      "after transfer old reserve yuan balance",
      oldReserveYuanBalance.toString()
    );

    newReserveBalance = await usdx.balanceOf(newReserveAddress);
    console.log(
      "after transfer new reserve usdx balance",
      newReserveBalance.toString()
    );
    newReserveYuanBalance = await yuan.balanceOf(newReserveAddress);
    console.log(
      "after transfer new reserve yuan balance",
      newReserveYuanBalance.toString()
    );

    userBalance = await usdx.balanceOf(fakeUser);
    console.log("after transfer user balance", userBalance.toString());

    await stopImpersonatingAccount(proposer);
  });
});
