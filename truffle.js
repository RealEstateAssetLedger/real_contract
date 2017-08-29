const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = process.env.TEST_MNEMONIC || 'real mnemonic real mnemonic real mnemonic real mnemonic real mnemonic real mnemonic';
const providerRopsten = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/', 0);
const providerKovan = new HDWalletProvider(mnemonic, 'https://kovan.infura.io', 0);

module.exports = {
    networks: {
        development: {
            network_id: 15,
            host: "localhost",
            port: 8545,
<<<<<<< HEAD
            // gas: 4000000,
            // gasPrice: 20e9,
            from: '0x0581E7aF436e9380a8B772885A66Bd84F790939D',
=======
            gas: 4000000,
            gasPrice: 20e9,
            from: '0x8a838b1722750ba185f189092833791adb98955f',
>>>>>>> 105691916fc4688b0617fdf2dd7343815ef10ca9
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
<<<<<<< HEAD
            provider: providerRopsten,
            from: '0x0581E7aF436e9380a8B772885A66Bd84F790939D',
            gas: 4000000,
            gasPrice: 20e9,
=======
            host: "localhost",
            port: 8545,
            // gas: 4000000,
            // gasPrice: 20e9,
            from: '0x004B8b840DE404B607d6548b98c711Ac818D750e',
>>>>>>> 105691916fc4688b0617fdf2dd7343815ef10ca9
        },
        kovan: {
            network_id: 42,
            provider: providerKovan,
            gas: 4000000,
            gasPrice: 20e9,
        },
    }
};
