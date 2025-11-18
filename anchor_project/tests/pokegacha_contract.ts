import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PokegachaContract } from "../target/types/pokegacha_contract";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("pokegacha_contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.pokegachaContract as Program<PokegachaContract>;

  // Test accounts
  let gameOwner: Keypair;
  let user1: Keypair;
  let user2: Keypair;

  // PDAs
  let configPda: PublicKey;
  let user1DataPda: PublicKey;
  let user1PokedexPda: PublicKey;
  let user2DataPda: PublicKey;
  let user2PokedexPda: PublicKey;

  // Constants
  const LAMPORT_PER_COIN = 100_000;
  const GACHA_COST = 10;

  // PDA Seeds
  const CONFIG_SEED = "CONFIG_SEED";
  const USER_SEED = "USER_SEED";
  const POKEDEX_SEED = "POKEDEX_SEED";
  const POKEMON_SEED = "POKEMON_SEED";

  // Helper function to airdrop SOL
  async function airdrop(publicKey: PublicKey, amount: number) {
    const signature = await provider.connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  }

  // Helper function to get account balance
  async function getBalance(publicKey: PublicKey): Promise<number> {
    return await provider.connection.getBalance(publicKey);
  }

  // Setup - runs before all tests
  before(async () => {
    // Create test keypairs
    gameOwner = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await airdrop(gameOwner.publicKey, 10);
    await airdrop(user1.publicKey, 10);
    await airdrop(user2.publicKey, 10);

    // Derive PDAs
    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_SEED)],
      program.programId
    );

    [user1DataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), user1.publicKey.toBuffer()],
      program.programId
    );

    [user1PokedexPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POKEDEX_SEED), user1.publicKey.toBuffer()],
      program.programId
    );

    [user2DataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), user2.publicKey.toBuffer()],
      program.programId
    );

    [user2PokedexPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POKEDEX_SEED), user2.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Happy Path Tests", () => {
    it("Should initialize game config successfully", async () => {
      const tx = await program.methods
        .initialize()
        .accounts({
          signer: gameOwner.publicKey
        })
        .signers([gameOwner])
        .rpc();

      console.log("Initialize transaction signature:", tx);

      // Verify config account was created
      const configAccount = await program.account.gameAuthority.fetch(configPda);
      assert.ok(configAccount.owner.equals(gameOwner.publicKey));
    });

    it("Should create user with valid username", async () => {
      const username = "TestUser1";

      const tx = await program.methods
        .createUser(username)
        .accounts({
          signer: user1.publicKey,
        })
        .signers([user1])
        .rpc();

      console.log("Create user transaction signature:", tx);

      // Verify user account was created correctly
      const userAccount = await program.account.userData.fetch(user1DataPda);
      assert.equal(userAccount.username, username);
      assert.ok(userAccount.address.equals(user1.publicKey));
      assert.equal(userAccount.balance.toNumber(), 100); // Initial balance
      assert.equal(userAccount.pokemonCount.toNumber(), 0);
      assert.equal(userAccount.bio, "This user has not write anything yet");

      // Verify pokedex was created
      const pokedexAccount = await program.account.pokedex.fetch(user1PokedexPda);
      assert.equal(pokedexAccount.ids.length, 0);
    });

    it("Should topup balance with sufficient SOL", async () => {
      const topupAmount = 50; // 50 coins
      const requiredLamports = topupAmount * LAMPORT_PER_COIN;

      const userBalanceBefore = await getBalance(user1.publicKey);
      const configBalanceBefore = await getBalance(configPda);

      const tx = await program.methods
        .topup(new BN(topupAmount))
        .accounts({
          signer: user1.publicKey,
        })
        .signers([user1])
        .rpc();

      console.log("Topup transaction signature:", tx);

      // Verify user's coin balance increased
      const userAccount = await program.account.userData.fetch(user1DataPda);
      assert.equal(userAccount.balance.toNumber(), 150); // 100 initial + 50 topup

      // Verify SOL was transferred
      const userBalanceAfter = await getBalance(user1.publicKey);
      const configBalanceAfter = await getBalance(configPda);

      assert.isBelow(userBalanceAfter, userBalanceBefore); // User spent SOL
      assert.equal(configBalanceAfter - configBalanceBefore, requiredLamports); // Config received SOL
    });

    it("Should perform gacha with sufficient coins", async () => {
      // Mock gacha result
      const gachaResult = {
        id: 25, // Pikachu
        isShiny: false,
        gender: { male: {} },
        worth: new BN(5),
      };

      const userAccountBefore = await program.account.userData.fetch(user1DataPda);
      const balanceBefore = userAccountBefore.balance.toNumber();
      const pokemonCountBefore = userAccountBefore.pokemonCount.toNumber();

      // Derive Pokemon PDA
      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCountBefore).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const tx = await program.methods
        .gacha(gachaResult)
        .accounts({
          owner : user1.publicKey,
          userData: user1DataPda,
        })
        .signers([user1])
        .rpc();

      console.log("Gacha transaction signature:", tx);

      // Verify user's balance decreased
      const userAccountAfter = await program.account.userData.fetch(user1DataPda);
      assert.equal(userAccountAfter.balance.toNumber(), balanceBefore - GACHA_COST);
      assert.equal(userAccountAfter.pokemonCount.toNumber(), pokemonCountBefore + 1);

      // Verify Pokemon was created
      const pokemonAccount = await program.account.pokemon.fetch(pokemonPda);
      assert.equal(pokemonAccount.id, gachaResult.id);
      assert.equal(pokemonAccount.isShiny, gachaResult.isShiny);
      assert.ok(pokemonAccount.owner.equals(user1.publicKey));
      assert.equal(pokemonAccount.worth.toNumber(), gachaResult.worth.toNumber());

      // Verify Pokedex was updated
      const pokedexAccount = await program.account.pokedex.fetch(user1PokedexPda);
      
      assert.ok(pokedexAccount.ids.includes(gachaResult.id));
    });

    it("Should release Pokemon as owner and receive coins", async () => {
      // Get the Pokemon we created in the previous test
      const pokemonCount = 0;
      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const pokemonAccount = await program.account.pokemon.fetch(pokemonPda);
      const pokemonWorth = pokemonAccount.worth.toNumber();

      const userAccountBefore = await program.account.userData.fetch(user1DataPda);
      const balanceBefore = userAccountBefore.balance.toNumber();

      const tx = await program.methods
        .release()
        .accounts({
          signer: user1.publicKey,
          // userData: user1DataPda,
          pokemon: pokemonPda,
          // config: configPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Release Pokemon transaction signature:", tx);

      // Verify user's balance increased
      const userAccountAfter = await program.account.userData.fetch(user1DataPda);
      assert.equal(userAccountAfter.balance.toNumber(), balanceBefore + pokemonWorth);

      // Verify Pokemon account was closed
      try {
        await program.account.pokemon.fetch(pokemonPda);
        assert.fail("Pokemon account should be closed");
      } catch (error) {
        // Expected to fail
        assert.include(error.message, "Account does not exist");
      }
    });

    it("Should allow game owner to withdraw SOL", async () => {
      const configBalanceBefore = await getBalance(configPda);
      const withdrawAmount = 1_000_000; // 0.001 SOL

      const ownerBalanceBefore = await getBalance(gameOwner.publicKey);

      const tx = await program.methods
        .withdraw(new BN(withdrawAmount))
        .accounts({
          owner: gameOwner.publicKey,
          config: configPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([gameOwner])
        .rpc();

      console.log("Withdraw transaction signature:", tx);

      // Verify SOL was transferred
      const configBalanceAfter = await getBalance(configPda);
      const ownerBalanceAfter = await getBalance(gameOwner.publicKey);

      assert.equal(configBalanceBefore - configBalanceAfter, withdrawAmount);
      assert.isAbove(ownerBalanceAfter, ownerBalanceBefore); // Owner received SOL (minus gas)
    });

    it("Should rename Pokemon successfully as owner", async () => {
      // First, create a new Pokemon for user1
      const gachaResult = {
        id: 4, // Charmander
        isShiny: false,
        gender: { male: {} },
        worth: new BN(5),
      };

      const userAccount = await program.account.userData.fetch(user1DataPda);
      const pokemonCount = userAccount.pokemonCount.toNumber();

      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .gacha(gachaResult)
        .accounts({
          owner: user1.publicKey,
          userData: user1DataPda,
        })
        .signers([user1])
        .rpc();

      // Now rename the Pokemon
      const newName = "Charmy";

      const tx = await program.methods
        .rename(newName)
        .accounts({
          signer: user1.publicKey,
          pokemon: pokemonPda,
        })
        .signers([user1])
        .rpc();

      console.log("Rename Pokemon transaction signature:", tx);

      // Verify Pokemon was renamed
      const pokemonAccount = await program.account.pokemon.fetch(pokemonPda);
      assert.equal(pokemonAccount.name, newName);
      assert.equal(pokemonAccount.id, gachaResult.id);
      assert.ok(pokemonAccount.owner.equals(user1.publicKey));
    });
  });

  describe("Unhappy Path Tests", () => {
    it("Should fail to initialize config twice", async () => {
      try {
        await program.methods
          .initialize()
          .accounts({
            signer: gameOwner.publicKey,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([gameOwner])
          .rpc();

        assert.fail("Should have thrown error for duplicate initialization");
      } catch (error) {
        assert.include(error.message, "already in use");
      }
    });

    it("Should fail to create user with username too long", async () => {
      const longUsername = "ThisUsernameIsWayTooLongAndExceedsTwentyCharacters";
      const newUser = Keypair.generate();
      await airdrop(newUser.publicKey, 1);

      const [newUserDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_SEED), newUser.publicKey.toBuffer()],
        program.programId
      );

      const [newUserPokedexPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POKEDEX_SEED), newUser.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createUser(longUsername)
          .accounts({
            signer: newUser.publicKey,
            // userData: newUserDataPda,
            // pokedex: newUserPokedexPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([newUser])
          .rpc();

        assert.fail("Should have thrown error for username too long");
      } catch (error) {
        assert.include(error.message, "NameTooLong");
      }
    });

    it("Should fail to create duplicate user", async () => {
      try {
        await program.methods
          .createUser("TestUser1")
          .accounts({
            signer: user1.publicKey,
            // userData: user1DataPda,
            // pokedex: user1PokedexPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        assert.fail("Should have thrown error for duplicate user");
      } catch (error) {
        assert.include(error.message, "already in use");
      }
    });

    it("Should fail to topup with insufficient SOL", async () => {
      // Create a new user with minimal SOL
      const poorUser = Keypair.generate();
      await airdrop(poorUser.publicKey, 0.05); // Very small amount

      const [poorUserDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_SEED), poorUser.publicKey.toBuffer()],
        program.programId
      );

      const [poorUserPokedexPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POKEDEX_SEED), poorUser.publicKey.toBuffer()],
        program.programId
      );

      // First create the user
      await program.methods
        .createUser("PoorUser")
        .accounts({
          signer: poorUser.publicKey,
          // userData: poorUserDataPda,
          // pokedex: poorUserPokedexPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([poorUser])
        .rpc();

      // Try to topup with more than they have
      try {
        await program.methods
          .topup(new BN(10000)) // 10000 coins = 1 SOL
          .accounts({
            signer: poorUser.publicKey,
            // userData: poorUserDataPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([poorUser])
          .rpc();

        assert.fail("Should have thrown error for insufficient funds");
      } catch (error) {
        assert.include(error.message, "InsufficientFunds");
      }
    });

    it("Should fail to topup for non-existent user", async () => {
      const nonExistentUser = Keypair.generate();
      await airdrop(nonExistentUser.publicKey, 1);

      const [nonExistentUserDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_SEED), nonExistentUser.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .topup(new BN(10))
          .accounts({
            signer: nonExistentUser.publicKey,
            // userData: nonExistentUserDataPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([nonExistentUser])
          .rpc();

        assert.fail("Should have thrown error for non-existent user");
      } catch (error) {
        assert.include(error.message, "AccountNot");
      }
    });

    it("Should fail to gacha with insufficient coins", async () => {
      // Create a new user who will have only 100 initial coins
      const newUser = Keypair.generate();
      await airdrop(newUser.publicKey, 1);

      const [newUserDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_SEED), newUser.publicKey.toBuffer()],
        program.programId
      );

      const [newUserPokedexPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POKEDEX_SEED), newUser.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createUser("GachaUser")
        .accounts({
          signer: newUser.publicKey,
          // userData: newUserDataPda,
          // pokedex: newUserPokedexPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([newUser])
        .rpc();

      // Perform gacha 10 times to drain coins (100 initial coins / 10 per gacha = 10 rolls)
      for (let i = 0; i < 10; i++) {
        const gachaResult = {
          id: 1 + i,
          isShiny: false,
          gender: { male: {} },
          worth: new BN(5),
        };

        const [pokemonPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(POKEMON_SEED),
            newUserDataPda.toBuffer(),
            new BN(i).toArrayLike(Buffer, "le", 8),
          ],
          program.programId
        );

        await program.methods
          .gacha(gachaResult)
          .accounts({
            owner: newUser.publicKey,
            userData: newUserDataPda,
            // pokedex: newUserPokedexPda,
            // pokemon: pokemonPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([newUser])
          .rpc();
      }

      // Now try one more gacha with 0 coins
      const gachaResult = {
        id: 150,
        isShiny: true,
        gender: { female: {} },
        worth: new BN(10),
      };

      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          newUserDataPda.toBuffer(),
          new BN(10).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .gacha(gachaResult)
          .accounts({
            owner: newUser.publicKey,
            userData: newUserDataPda,
            // pokedex: newUserPokedexPda,
            // pokemon: pokemonPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([newUser])
          .rpc();

        assert.fail("Should have thrown error for insufficient coins");
      } catch (error) {
        assert.include(error.message, "InsufficientCoins");
      }
    });

    it("Should fail to gacha for non-existent user", async () => {
      const nonExistentUser = Keypair.generate();
      await airdrop(nonExistentUser.publicKey, 1);

      const [nonExistentUserDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_SEED), nonExistentUser.publicKey.toBuffer()],
        program.programId
      );

      const [nonExistentPokedexPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POKEDEX_SEED), nonExistentUser.publicKey.toBuffer()],
        program.programId
      );

      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          nonExistentUserDataPda.toBuffer(),
          new BN(0).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const gachaResult = {
        id: 1,
        isShiny: false,
        gender: { male: {} },
        worth: new BN(5),
      };

      try {
        await program.methods
          .gacha(gachaResult)
          .accounts({
            // owner: nonExistentUser.publicKey,
            userData: nonExistentUserDataPda,
            // pokedex: nonExistentPokedexPda,
            // pokemon: pokemonPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([nonExistentUser])
          .rpc();

        assert.fail("Should have thrown error for non-existent user");
      } catch (error) {
        assert.include(error.message, "Reached maximum depth ");
      }
    });

    it("Should fail when non-owner attempts to release Pokemon", async () => {
      // Create user2 and have them try to release user1's Pokemon
      await program.methods
        .createUser("TestUser2")
        .accounts({
          signer: user2.publicKey,
          // userData: user2DataPda,
          // pokedex: user2PokedexPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      // User1 creates a Pokemon
      const gachaResult = {
        id: 7, // Squirtle
        isShiny: false,
        gender: { male: {} },
        worth:  new BN(5),
      };

      const userAccount = await program.account.userData.fetch(user1DataPda);
      const pokemonCount = userAccount.pokemonCount.toNumber();

      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .gacha(gachaResult)
        .accounts({
          owner: user1.publicKey,
          userData: user1DataPda,
          // pokedex: user1PokedexPda,
          // pokemon: pokemonPda,
          // config: configPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      // User2 tries to release User1's Pokemon
      try {
        await program.methods
          .release()
          .accounts({
            signer: user2.publicKey,
            // userData: user2DataPda,
            pokemon: pokemonPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        assert.fail("Should have thrown error for unauthorized release");
      } catch (error) {
        
        assert.include(error.message, "Unauthorized.");
      }
    });

    it("Should fail to release non-existent Pokemon", async () => {
      // Try to release a Pokemon that doesn't exist
      const [nonExistentPokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(9999).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .release()
          .accounts({
            signer: user1.publicKey,
            // userData: user1DataPda,
            pokemon: nonExistentPokemonPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        assert.fail("Should have thrown error for non-existent Pokemon");
      } catch (error) {
        
        assert.include(error.message, "AccountNotInitialized.");
      }
    });

    it("Should fail when non-owner attempts to withdraw", async () => {
      const maliciousUser = Keypair.generate();
      await airdrop(maliciousUser.publicKey, 1);

      try {
        await program.methods
          .withdraw(new BN(100_000))
          .accounts({
            owner: maliciousUser.publicKey,
            config: configPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([maliciousUser])
          .rpc();

        assert.fail("Should have thrown error for unauthorized withdrawal");
      } catch (error) {
        // The has_one constraint should fail
        // console.log(error.message)
        assert.include(error.message, "ConstraintHasOne.");
      }
    });

    it("Should fail to withdraw more than config balance", async () => {
      const configBalance = await getBalance(configPda);
      const excessiveAmount = configBalance + 1_000_000; // More than available

      try {
        await program.methods
          .withdraw(new BN(excessiveAmount))
          .accounts({
            owner: gameOwner.publicKey,
            config: configPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([gameOwner])
          .rpc();

        assert.fail("Should have thrown error for insufficient funds");
      } catch (error) {
        assert.include(error.message, "InsufficientFunds");
      }
    });

    it("Should fail to rename Pokemon when not the owner", async () => {
      // Get a Pokemon owned by user1
      const userAccount = await program.account.userData.fetch(user1DataPda);
      const pokemonCount = userAccount.pokemonCount.toNumber();

      // Get the last Pokemon created for user1
      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount - 1).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      // User2 tries to rename User1's Pokemon
      try {
        await program.methods
          .rename("HackedName")
          .accounts({
            signer: user2.publicKey,
            pokemon: pokemonPda,
          })
          .signers([user2])
          .rpc();

        assert.fail("Should have thrown error for unauthorized rename");
      } catch (error) {
        assert.include(error.message, "Unauthorized");
      }
    });

    it("Should fail to rename Pokemon with name too long", async () => {
      // Get a Pokemon owned by user1
      const userAccount = await program.account.userData.fetch(user1DataPda);
      const pokemonCount = userAccount.pokemonCount.toNumber();

      const [pokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount - 1).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const tooLongName = "ThisNameIsWayTooLongAndExceedsTwentyCharacters";

      try {
        await program.methods
          .rename(tooLongName)
          .accounts({
            signer: user1.publicKey,
            pokemon: pokemonPda,
          })
          .signers([user1])
          .rpc();

        assert.fail("Should have thrown error for name too long");
      } catch (error) {
        assert.include(error.message, "NameTooLong");
      }
    });

    it("Should fail to rename non-existent Pokemon", async () => {
      // Try to rename a Pokemon that doesn't exist
      const [nonExistentPokemonPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(99999).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .rename("NewName")
          .accounts({
            signer: user1.publicKey,
            pokemon: nonExistentPokemonPda,
          })
          .signers([user1])
          .rpc();

        assert.fail("Should have thrown error for non-existent Pokemon");
      } catch (error) {
        assert.include(error.message, "AccountNotInitialized");
      }
    });
  });

  describe("Edge Case Tests", () => {
    it("Should handle multiple Pokemon of same species in Pokedex", async () => {
      // Create two Pokemon of the same species
      const gachaResult1 = {
        id: 25, // Pikachu
        isShiny: false,
        gender: { male: {} },
        worth: new BN(5),
      };

      const gachaResult2 = {
        id: 25, // Pikachu again
        isShiny: true, // But shiny this time
        gender: { female: {} },
        worth: new BN(10),
      };

      const userAccountBefore = await program.account.userData.fetch(user1DataPda);
      let pokemonCount = userAccountBefore.pokemonCount.toNumber();

      // First Pikachu
      const [pokemon1Pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .gacha(gachaResult1)
        .accounts({
          owner: user1.publicKey,
          userData: user1DataPda,
          // pokedex: user1PokedexPda,
          // pokemon: pokemon1Pda,
          // config: configPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      pokemonCount++;

      // Second Pikachu
      const [pokemon2Pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(POKEMON_SEED),
          user1DataPda.toBuffer(),
          new BN(pokemonCount).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .gacha(gachaResult2)
        .accounts({
          owner: user1.publicKey,
          userData: user1DataPda,
          // pokedex: user1PokedexPda,
          // pokemon: pokemon2Pda,
          // config: configPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      // Verify Pokedex only has one entry for species 25
      const pokedexAccount = await program.account.pokedex.fetch(user1PokedexPda);
      const pikachus = pokedexAccount.ids.filter((id) => id === 25);
      assert.equal(pikachus.length, 1, "Pokedex should only have one entry per species");

      // Verify both Pokemon exist with different stats
      const pokemon1 = await program.account.pokemon.fetch(pokemon1Pda);
      const pokemon2 = await program.account.pokemon.fetch(pokemon2Pda);

      assert.equal(pokemon1.id, pokemon2.id);
      assert.notEqual(pokemon1.isShiny, pokemon2.isShiny);
    });

    it("Should handle zero amount topup gracefully", async () => {
      try {
        await program.methods
          .topup(new BN(0))
          .accounts({
            signer: user1.publicKey,
            // userData: user1DataPda,
            // config: configPda,
            // systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        // If it succeeds, verify nothing changed
        // (This might fail or succeed depending on implementation)
      } catch (error) {
        // Either behavior is acceptable for edge case
        console.log("Zero topup rejected:", error.message);
      }
    });

    it("Should create user with maximum length username (20 chars)", async () => {
      const maxLengthUsername = "12345678901234567890"; // Exactly 20 chars
      const maxUser = Keypair.generate();
      await airdrop(maxUser.publicKey, 1);

      const [maxUserDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_SEED), maxUser.publicKey.toBuffer()],
        program.programId
      );

      const [maxUserPokedexPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POKEDEX_SEED), maxUser.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .createUser(maxLengthUsername)
        .accounts({
          signer: maxUser.publicKey,
          // userData: maxUserDataPda,
          // pokedex: maxUserPokedexPda,
          // systemProgram: SystemProgram.programId,
        })
        .signers([maxUser])
        .rpc();

      const userAccount = await program.account.userData.fetch(maxUserDataPda);
      assert.equal(userAccount.username, maxLengthUsername);
    });
  });
});
