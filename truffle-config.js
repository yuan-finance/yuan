require('dotenv').config();

const HDWalletProvider = require("truffle-hdwallet-provider");
var infuraKey = process.env.INFURA_APIKEY;

const readline = require('readline');
const deployer = require('./deployer.json');

const network = process.env.NETWORK;
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${infuraKey}`));
// var password = await cipherTextProcess('Please enter your password:\n');
var password = "test!"
var res = web3.eth.accounts.decrypt(deployer, password.toString().replace(/[\r\n]/g,""));

var privateKeys = res.privateKey.slice(2);
const keyLength = 1;


module.exports = {
    /**
     * Networks define how you connect to your ethereum client and let you set the
     * defaults web3 uses to send transactions. If you don't specify one truffle
     * will spin up a development blockchain for you on port 9545 when you
     * run `develop` or `test`. You can ask a truffle command to use a specific
     * network from the command line, e.g
     *
     * $ truffle test --network <network-name>
     */

    networks: {
        // Useful for testing. The `development` name is special - truffle uses it by default
        // if it's defined here and no other network is specified at the command line.
        // You should run a client (like ganache-cli, geth or parity) in a separate terminal
        // tab if you use this network and you must also set the `host`, `port` and `network_id`
        // options below to some value.
        //
        development: {
            host: "localhost",
            port: 7545,
            network_id: "*",
            gasPrice: 20000000000,
            gas: 8000000
        },

        mainnet: {
            provider: () => new HDWalletProvider(privateKeys, `https://mainnet.infura.io/v3/${infuraKey}`, 0 , keyLength),
            network_id: 1, // Mainnet's id
            gas: 6721975, // Gas limit used for deploys
            gasPrice: 7000000000, // Gas price used for deploys: 7gwei
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },

        kovan: {
            provider: () => new HDWalletProvider(privateKeys, `https://kovan.infura.io/v3/${infuraKey}`, 0 , keyLength),
            network_id: 42, // Kovan's id
            gas: 6721975,
            gasPrice: 1000000000, // Gas price used for deploys: 10gwei
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            networkCheckTimeout: 600000
        },

        ropsten: {
            provider: () => new HDWalletProvider(privateKeys, `https://ropsten.infura.io/v3/${infuraKey}`, 0 , keyLength),
            network_id: 3, // ropsten's id
            gas: 6721975,
            gasPrice: 10000000000, // Gas price used for deploys: 10gwei
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },

        rinkeby: {
            provider: () => new HDWalletProvider(privateKeys, `https://rinkeby.infura.io/v3/${infuraKey}`, 0 , keyLength),
            network_id: 4, // ropsten's id
            gas: 6721975,
            gasPrice: 10000000000, // Gas price used for deploys: 10gwei
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        }
    },

    // Set default mocha options here, use special reporters etc.
    mocha: {
        enableTimeouts: false,
        useColors: true,
        bail: true
    },

    // Configure your compilers
    compilers: {
        solc: {
            version: "0.5.15", // Fetch exact version from solc-bin (default: truffle's version)
            // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
            settings: { // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                //  evmVersion: "byzantium"
                // }
            }
        }
    },
    plugins: [
        'truffle-plugin-verify'
    ],
    api_keys: {
        etherscan: process.env.ETHERSCAN_KEY
    }
}
