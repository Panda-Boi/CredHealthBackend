// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyNFT.sol"; // Import the NFT contract

contract HealthInsurance {
    // Policy structure
    struct Policy {
        string userId;               // Unique identifier for the user
        address userWalletAddress;   // User's wallet address
        uint256 initialHealthScore; // Baseline health score (1-100)
        uint256 coverageAmount;     // Coverage amount in wei or tokens
        uint256 premiumAmount;      // Premium amount in wei or tokens
        uint256 coverageDuration;   // Coverage duration in days
        uint256 currentHealthPoints; // Current health points (1-100)
        uint256 rollingAverage;     // Rolling average of health points
        uint256 k;                  // Number of updates (for rolling average)
        bool isActive;               // Policy status
    }

    // Constants for premium and coverage adjustment
    uint256 private constant BASE_PREMIUM = 100 ether; // Base premium at 50 health points
    uint256 private constant BASE_COVERAGE = 1000 ether; // Base coverage at 50 health points
    uint256 private constant PREMIUM_SENSITIVITY = 2 ether; // Premium change per health point
    uint256 private constant COVERAGE_SENSITIVITY = 20 ether; // Coverage change per health point

    // Mapping to store policies by policyId
    mapping(string => Policy) public policies;
    string[] public policyIds; // List of all policy IDs

    // Mapping to store token IDs for each policy
    mapping(string => uint256) public policyToTokenId;

    // Reference to the NFT contract
    PolicyNFT private policyNFT;

    // Events
    event PolicyCreated(string policyId, address userWalletAddress);
    event HealthPointsUpdated(string policyId, uint256 newHealthPoints, uint256 rollingAverage);
    event PremiumAdjusted(string policyId, uint256 newPremiumAmount);
    event CoverageAdjusted(string policyId, uint256 newCoverageAmount);

    // Constructor to initialize the NFT contract
    constructor(address _policyNFTAddress) {
        policyNFT = PolicyNFT(_policyNFTAddress);
    }

    // Internal function to calculate premium based on health points
    function _calculatePremium(uint256 healthPoints) internal pure returns (uint256) {
        // Premium increases as health points decrease below 50, and decreases as health points increase above 50
        if (healthPoints < 50) {
            return BASE_PREMIUM + (50 - healthPoints) * PREMIUM_SENSITIVITY;
        } else {
            return BASE_PREMIUM - (healthPoints - 50) * PREMIUM_SENSITIVITY;
        }
    }

    // Internal function to calculate coverage based on health points
    function _calculateCoverage(uint256 healthPoints) internal pure returns (uint256) {
        // Coverage decreases as health points decrease below 50,
        // and increases as health points increase above 50
        if (healthPoints < 50) {
            return BASE_COVERAGE - (50 - healthPoints) * COVERAGE_SENSITIVITY;
        } else {
            return BASE_COVERAGE + (healthPoints - 50) * COVERAGE_SENSITIVITY;
        }
    }

    // Create a new policy
    function createPolicy(
        string memory policyId,
        string memory userId,
        address userWalletAddress,
        uint256 initialHealthScore,
        uint256 coverageDuration
    ) public {
        require(initialHealthScore >= 1 && initialHealthScore <= 100, "Health score must be between 1 and 100");
        require(coverageDuration > 0, "Coverage duration must be greater than 0");

        // Calculate initial premium and coverage
        uint256 initialPremium = _calculatePremium(initialHealthScore);
        uint256 initialCoverage = _calculateCoverage(initialHealthScore);

        policies[policyId] = Policy({
            userId: userId,
            userWalletAddress: userWalletAddress,
            initialHealthScore: initialHealthScore,
            coverageAmount: initialCoverage,
            premiumAmount: initialPremium,
            coverageDuration: coverageDuration,
            currentHealthPoints: initialHealthScore,
            rollingAverage: initialHealthScore, // Initialize rolling average
            k: 1, // Initialize k
            isActive: true
        });

        policyIds.push(policyId);

        // Mint an NFT for the policy
        uint256 tokenId = policyNFT.mintPolicyNFT(
            userWalletAddress, // Recipient address
            initialHealthScore, // Health points
            userId, // User ID
            initialCoverage, // Coverage amount
            initialPremium, // Premium amount
            coverageDuration // Coverage duration
        );
        policyToTokenId[policyId] = tokenId; // Store the tokenId

        emit PolicyCreated(policyId, userWalletAddress);
    }

    // Update health points with rolling average
    function updateHealthPoints(string memory policyId, uint256 newHealthPoints) public {
        require(policies[policyId].isActive, "Policy is not active");
        require(newHealthPoints >= 0 && newHealthPoints <= 100, "Health points must be between 0 and 100");

        Policy storage policy = policies[policyId];

        uint256 k = policy.k + 1;
        uint256 newAvg;
        
        // Handle the rolling average calculation safely
        if (newHealthPoints > policy.rollingAverage) {
            // If new health points are higher, we can safely add
            newAvg = policy.rollingAverage + (newHealthPoints - policy.rollingAverage) / k;
        } else if (newHealthPoints < policy.rollingAverage) {
            // If new health points are lower, we can safely subtract
            newAvg = policy.rollingAverage - (policy.rollingAverage - newHealthPoints) / k;
        } else {
            // If equal, no change
            newAvg = policy.rollingAverage;
        }

        // Update policy state
        policy.currentHealthPoints = newHealthPoints;
        policy.rollingAverage = newAvg;
        policy.k += 1;

        // Adjust premium and coverage based on rolling average
        uint256 newPremium = _calculatePremium(newAvg);
        uint256 newCoverage = _calculateCoverage(newAvg);

        policy.premiumAmount = newPremium;
        policy.coverageAmount = newCoverage;

        // Update the NFT's metadata
        uint256 tokenId = policyToTokenId[policyId];
        policyNFT.updatePolicyNFT(tokenId, newAvg, newCoverage, newPremium);

        emit HealthPointsUpdated(policyId, newHealthPoints, newAvg);
        emit PremiumAdjusted(policyId, newPremium);
        emit CoverageAdjusted(policyId, newCoverage);
    }

    // Get policy details
    function getPolicyDetails(string memory policyId) public view returns (Policy memory) {
        return policies[policyId];
    }

    // Get token ID for a policy
    function getTokenIdForPolicy(string memory policyId) public view returns (uint256) {
        return policyToTokenId[policyId];
    }
}