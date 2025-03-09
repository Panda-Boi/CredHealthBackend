module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Ganache host
      port: 8545,        // Ganache port
      network_id: "*",    // Match any network ID
    },
  },
  compilers: {
    solc: {
      version: "0.8.20",   // Use the Solidity version you need
    },
  },
};