// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PolicyNFT is ERC721 {
    uint256 private _tokenIdCounter; // Simple counter for token IDs

    // Struct to store NFT metadata
    struct NFTMetadata {
        uint256 healthPoints;    // Current health points
        uint256 rollingAverage;  // Rolling average of health points
        string userId;           // Unique identifier for the user
        uint256 coverageAmount;  // Coverage amount in wei or tokens
        uint256 premiumAmount;   // Premium amount in wei or tokens
        uint256 coverageDuration; // Coverage duration in days
    }

    // Mapping to store metadata for each token
    mapping(uint256 => NFTMetadata) public tokenMetadata;

    // Events
    event PolicyNFTMinted(uint256 tokenId, address recipient, uint256 healthPoints);
    event PolicyNFTUpdated(uint256 tokenId, uint256 newHealthPoints, uint256 newCoverageAmount, uint256 newPremiumAmount);

    constructor() ERC721("PolicyNFT", "PNFT") {
        _tokenIdCounter = 0; // Initialize the counter
    }

    // Mint a new NFT for a policy
    function mintPolicyNFT(
        address recipient,
        uint256 healthPoints,
        string memory userId,
        uint256 coverageAmount,
        uint256 premiumAmount,
        uint256 coverageDuration
    ) public returns (uint256) {
        _tokenIdCounter++; // Increment the counter
        uint256 newTokenId = _tokenIdCounter; // Use the current counter value as the token ID

        _mint(recipient, newTokenId);

        // Store metadata for the NFT
        tokenMetadata[newTokenId] = NFTMetadata({
            healthPoints: healthPoints,
            rollingAverage: healthPoints, // Initialize rolling average
            userId: userId,
            coverageAmount: coverageAmount,
            premiumAmount: premiumAmount,
            coverageDuration: coverageDuration
        });

        emit PolicyNFTMinted(newTokenId, recipient, healthPoints);
        return newTokenId;
    }

    // Update health points, coverage, and premium for an NFT
    function updatePolicyNFT(
        uint256 tokenId,
        uint256 newHealthPoints,
        uint256 newCoverageAmount,
        uint256 newPremiumAmount
    ) public {
        // Use ownerOf to check if the token exists (reverts if it doesn't)
        ownerOf(tokenId);

        // Update metadata
        tokenMetadata[tokenId].healthPoints = newHealthPoints;
        tokenMetadata[tokenId].coverageAmount = newCoverageAmount;
        tokenMetadata[tokenId].premiumAmount = newPremiumAmount;

        emit PolicyNFTUpdated(tokenId, newHealthPoints, newCoverageAmount, newPremiumAmount);
    }

    // Get metadata for an NFT
    function getPolicyNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        // Use ownerOf to check if the token exists (reverts if it doesn't)
        ownerOf(tokenId);
        return tokenMetadata[tokenId];
    }
}