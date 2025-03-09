const express = require("express");
const {Web3} = require("web3");
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Connect to the local blockchain (Ganache)
const web3 = new Web3("http://localhost:8545");

// Load contract ABI and address
const HealthInsuranceABI =  [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_policyNFTAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCoverageAmount",
        "type": "uint256"
      }
    ],
    "name": "CoverageAdjusted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newHealthPoints",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rollingAverage",
        "type": "uint256"
      }
    ],
    "name": "HealthPointsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "userWalletAddress",
        "type": "address"
      }
    ],
    "name": "PolicyCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newPremiumAmount",
        "type": "uint256"
      }
    ],
    "name": "PremiumAdjusted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "policies",
    "outputs": [
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "userWalletAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "initialHealthScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premiumAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverageDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentHealthPoints",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rollingAverage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "k",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "policyIds",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "policyToTokenId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "userWalletAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "initialHealthScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverageDuration",
        "type": "uint256"
      }
    ],
    "name": "createPolicy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "newHealthPoints",
        "type": "uint256"
      }
    ],
    "name": "updateHealthPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      }
    ],
    "name": "getPolicyDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "userId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "userWalletAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "initialHealthScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "coverageAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premiumAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "coverageDuration",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentHealthPoints",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rollingAverage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "k",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct HealthInsurance.Policy",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "policyId",
        "type": "string"
      }
    ],
    "name": "getTokenIdForPolicy",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];
const PolicyNFTABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "healthPoints",
        "type": "uint256"
      }
    ],
    "name": "PolicyNFTMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newHealthPoints",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCoverageAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newPremiumAmount",
        "type": "uint256"
      }
    ],
    "name": "PolicyNFTUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tokenMetadata",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "healthPoints",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rollingAverage",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premiumAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverageDuration",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "healthPoints",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premiumAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverageDuration",
        "type": "uint256"
      }
    ],
    "name": "mintPolicyNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newHealthPoints",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newCoverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newPremiumAmount",
        "type": "uint256"
      }
    ],
    "name": "updatePolicyNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPolicyNFTMetadata",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "healthPoints",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rollingAverage",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "userId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "coverageAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premiumAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "coverageDuration",
            "type": "uint256"
          }
        ],
        "internalType": "struct PolicyNFT.NFTMetadata",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];
const healthInsuranceAddress = "0xb7084cF82460D46ACeD63f01c1ea6665507dD032"; // Replace with deployed address
const policyNFTAddress = "0x9d2FABDB151e31D8f9584d1986f2B3F41735135B"; // Replace with deployed address

// Create contract instances
const healthInsurance = new web3.eth.Contract(HealthInsuranceABI, healthInsuranceAddress);
const policyNFT = new web3.eth.Contract(PolicyNFTABI, policyNFTAddress);

// API Endpoints

// Create a new policy
app.post("/createPolicy", async (req, res) => {
    const { policyId, userId, userWalletAddress, initialHealthScore, coverageDuration } = req.body;

    try {
        const result = await healthInsurance.methods
            .createPolicy(policyId, userId, userWalletAddress, initialHealthScore, coverageDuration)
            .send({ from: userWalletAddress,
                gas: 500000
             });

        res.json({ success: true, transactionHash: result.transactionHash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get policy details
app.get("/getPolicyDetails/:policyId", async (req, res) => {
    const { policyId } = req.params;

    try {
        const policy = await healthInsurance.methods.getPolicyDetails(policyId).call();

        // Convert BigInt values to strings
        const serializedPolicy = {
            userId: policy.userId,
            userWalletAddress: policy.userWalletAddress,
            initialHealthScore: policy.initialHealthScore.toString(),
            coverageAmount: web3.utils.fromWei(policy.coverageAmount.toString(), "ether"),
            premiumAmount: web3.utils.fromWei(policy.premiumAmount.toString(), "ether"),
            coverageDuration: policy.coverageDuration.toString(),
            currentHealthPoints: policy.currentHealthPoints.toString(),
            rollingAverage: policy.rollingAverage.toString(),
            k: policy.k.toString(),
            isActive: policy.isActive
        };

        res.json({ success: true, policy: serializedPolicy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update health points
// app.post("/updateHealthPoints", async (req, res) => {
//     const { policyId, newHealthPoints } = req.body;

//     try {
//         const result = await healthInsurance.methods
//             .updateHealthPoints(policyId, newHealthPoints)
//             .send({ from: "0xA440aF92d2fe8E2fB2743A2B60088D21Ee9120CD" }); // Replace with user's wallet address

//         res.json({ success: true, transactionHash: result.transactionHash });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

app.post("/updateHealthPoints", async (req, res) => {
    const { policyId, newHealthPoints, userWalletAddress } = req.body;

    try {
        const result = await healthInsurance.methods
            .updateHealthPoints(policyId, newHealthPoints)
            .send({ from: userWalletAddress, gas: 500000 }); // Use the user's wallet address

        res.json({ success: true, transactionHash: result.transactionHash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get NFT metadata
app.get("/getPolicyNFTMetadata/:tokenId", async (req, res) => {
    const { tokenId } = req.params;

    try {
        const metadata = await policyNFT.methods.getPolicyNFTMetadata(tokenId).call();

        // Convert BigInt values to strings
        const serializedMetadata = {
            healthPoints: metadata.healthPoints.toString(),
            userId: metadata.userId,
            coverageAmount: web3.utils.fromWei(metadata.coverageAmount.toString(), "ether"),
            premiumAmount: web3.utils.fromWei(metadata.premiumAmount.toString(), "ether"),
            coverageDuration: metadata.coverageDuration.toString()
        };

        res.json({ success: true, metadata: serializedMetadata });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
});