const HealthInsurance = artifacts.require("HealthInsurance");
const PolicyNFT = artifacts.require("PolicyNFT");

module.exports = async function (deployer) {
    await deployer.deploy(PolicyNFT);
    const policyNFT = await PolicyNFT.deployed();

    await deployer.deploy(HealthInsurance, policyNFT.address);
};