export type Staking = {
  "version": "0.1.0",
  "name": "staking",
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "* Initialize global pool\n     * super admin sets to the caller of this instruction"
      ],
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "changeRewardEnv",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "newRewardMint",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "newRewardEnable",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "newRewardPerDay",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "lockPnft",
      "docs": [
        "* User can lock pNFTs from specific collection"
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMintEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authRulesProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimReward",
      "docs": [
        "* User can claim reward"
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unlockPnft",
      "docs": [
        "* User can unlock pNFTs when they want"
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMintEdition",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong edition is supplied"
          ]
        },
        {
          "name": "tokenMintRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong record is supplied"
          ]
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong metadata is supplied"
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong rules are supplied"
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong sysvar ixns are supplied"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK intstruction will fail if wrong program is supplied"
          ]
        },
        {
          "name": "authRulesProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK intstruction will fail if wrong program is supplied"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "rewardPerDay",
            "type": "u64"
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "rewardEnable",
            "type": "bool"
          },
          {
            "name": "totalStakedCount",
            "type": "u64"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "userPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "itemCount",
            "type": "u64"
          },
          {
            "name": "rewardTime",
            "type": "i64"
          },
          {
            "name": "pendingReward",
            "type": "u64"
          },
          {
            "name": "extra",
            "type": "u128"
          },
          {
            "name": "items",
            "type": {
              "vec": {
                "defined": "StakedNFT"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakedNFT",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftAddr",
            "type": "publicKey"
          },
          {
            "name": "stakeTime",
            "type": "i64"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAdmin",
      "msg": "Admin address dismatch"
    },
    {
      "code": 6001,
      "name": "InvalidMetadata",
      "msg": "Metadata address is invalid"
    },
    {
      "code": 6002,
      "name": "InvalidCollection",
      "msg": "Collection is invalid"
    },
    {
      "code": 6003,
      "name": "MetadataCreatorParseError",
      "msg": "Can not parse creators in metadata"
    },
    {
      "code": 6004,
      "name": "LackVaultBalance",
      "msg": "Insufficient Reward Vault Balance"
    },
    {
      "code": 6005,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6006,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6007,
      "name": "DisabledReward",
      "msg": "Reward is disabled"
    }
  ]
};

export const IDL: Staking = {
  "version": "0.1.0",
  "name": "staking",
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "* Initialize global pool\n     * super admin sets to the caller of this instruction"
      ],
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "changeRewardEnv",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "newRewardMint",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "newRewardEnable",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "newRewardPerDay",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "lockPnft",
      "docs": [
        "* User can lock pNFTs from specific collection"
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMintEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authRulesProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimReward",
      "docs": [
        "* User can claim reward"
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unlockPnft",
      "docs": [
        "* User can unlock pNFTs when they want"
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMintEdition",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong edition is supplied"
          ]
        },
        {
          "name": "tokenMintRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong record is supplied"
          ]
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong metadata is supplied"
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong rules are supplied"
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK instruction will fail if wrong sysvar ixns are supplied"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK intstruction will fail if wrong program is supplied"
          ]
        },
        {
          "name": "authRulesProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK intstruction will fail if wrong program is supplied"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "rewardPerDay",
            "type": "u64"
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "rewardEnable",
            "type": "bool"
          },
          {
            "name": "totalStakedCount",
            "type": "u64"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "userPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "itemCount",
            "type": "u64"
          },
          {
            "name": "rewardTime",
            "type": "i64"
          },
          {
            "name": "pendingReward",
            "type": "u64"
          },
          {
            "name": "extra",
            "type": "u128"
          },
          {
            "name": "items",
            "type": {
              "vec": {
                "defined": "StakedNFT"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakedNFT",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftAddr",
            "type": "publicKey"
          },
          {
            "name": "stakeTime",
            "type": "i64"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAdmin",
      "msg": "Admin address dismatch"
    },
    {
      "code": 6001,
      "name": "InvalidMetadata",
      "msg": "Metadata address is invalid"
    },
    {
      "code": 6002,
      "name": "InvalidCollection",
      "msg": "Collection is invalid"
    },
    {
      "code": 6003,
      "name": "MetadataCreatorParseError",
      "msg": "Can not parse creators in metadata"
    },
    {
      "code": 6004,
      "name": "LackVaultBalance",
      "msg": "Insufficient Reward Vault Balance"
    },
    {
      "code": 6005,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6006,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6007,
      "name": "DisabledReward",
      "msg": "Reward is disabled"
    }
  ]
};
