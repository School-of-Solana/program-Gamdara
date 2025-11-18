/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pokegacha_contract.json`.
 */
export type PokegachaContract = {
  "address": "3ekPFgdBXUEFQwY1kDqfMpebP68jxba65erehQwcd8zw",
  "metadata": {
    "name": "pokegachaContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "pokedex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  75,
                  69,
                  68,
                  69,
                  88,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "gacha",
      "discriminator": [
        184,
        233,
        246,
        0,
        52,
        227,
        40,
        239
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "userData",
          "writable": true
        },
        {
          "name": "pokedex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  75,
                  69,
                  68,
                  69,
                  88,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "user_data.address",
                "account": "userData"
              }
            ]
          }
        },
        {
          "name": "pokemon",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  75,
                  69,
                  77,
                  79,
                  78,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "userData"
              },
              {
                "kind": "account",
                "path": "user_data.pokemon_count",
                "account": "userData"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "result",
          "type": {
            "defined": {
              "name": "gachaResult"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  78,
                  70,
                  73,
                  71,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "release",
      "discriminator": [
        253,
        249,
        15,
        206,
        28,
        127,
        193,
        241
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "pokemon",
          "writable": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  78,
                  70,
                  73,
                  71,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "rename",
      "discriminator": [
        98,
        63,
        129,
        146,
        24,
        170,
        185,
        45
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pokemon",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "topup",
      "discriminator": [
        126,
        42,
        49,
        78,
        225,
        151,
        99,
        77
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  78,
                  70,
                  73,
                  71,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  78,
                  70,
                  73,
                  71,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameAuthority",
      "discriminator": [
        70,
        138,
        172,
        219,
        156,
        226,
        228,
        116
      ]
    },
    {
      "name": "pokedex",
      "discriminator": [
        223,
        46,
        104,
        56,
        197,
        3,
        38,
        240
      ]
    },
    {
      "name": "pokemon",
      "discriminator": [
        3,
        219,
        80,
        238,
        124,
        221,
        251,
        165
      ]
    },
    {
      "name": "userData",
      "discriminator": [
        139,
        248,
        167,
        203,
        253,
        220,
        210,
        221
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientCoins",
      "msg": "Unable to gacha, Insufficient Coins"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Unable to topup, Insufficient funds in wallet"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "You are nor permitted to do this action"
    },
    {
      "code": 6003,
      "name": "nameTooLong",
      "msg": "Name is too long"
    }
  ],
  "types": [
    {
      "name": "gachaResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u8"
          },
          {
            "name": "isShiny",
            "type": "bool"
          },
          {
            "name": "gender",
            "type": {
              "defined": {
                "name": "gender"
              }
            }
          },
          {
            "name": "worth",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "gameAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "gender",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "male"
          },
          {
            "name": "female"
          }
        ]
      }
    },
    {
      "name": "pokedex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ids",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "pokemon",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "gender",
            "type": {
              "defined": {
                "name": "gender"
              }
            }
          },
          {
            "name": "isShiny",
            "type": "bool"
          },
          {
            "name": "worth",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "pokemonCount",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
