const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = process.env.TEST_MNEMONIC || 'real mnemonic real mnemonic real mnemonic real mnemonic real mnemonic real mnemonic';
const providerRopsten = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/', 0);
const providerKovan = new HDWalletProvider(mnemonic, 'https://kovan.infura.io', 0);

module.exports = {
    networks: {
        development: {
            network_id: 3,
            host: "localhost",
            port: 8545,
            // gas: 4000000,
            // gasPrice: 20e9,
            from: '0x0581E7aF436e9380a8B772885A66Bd84F790939D',
        },
        development_migrate: {
            network_id: 15,
            host: "localhost",
            port: 8545,
            gas: 4000000,
            gasPrice: 20e9,
            from: "0x0581E7aF436e9380a8B772885A66Bd84F790939D",
        },
        mainnet: {
            network_id: 1,
            host: "localhost",
            port: 8545,
            gas: 4000000,
            gasPrice: 20e9,
            from: "0x0581E7aF436e9380a8B772885A66Bd84F790939D",
        },
        ropsten: {
            network_id: 3,
            provider: providerRopsten,
            from: '0x0581E7aF436e9380a8B772885A66Bd84F790939D',
            gas: 4000000,
            gasPrice: 20e9,
        },
        kovan: {
            network_id: 42,
            provider: providerKovan,
            gas: 4000000,
            gasPrice: 20e9,
        },
    }
};
