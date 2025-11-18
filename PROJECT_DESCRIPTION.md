# Project Description

**Deployed Frontend URL:** [Add your Vercel deployment URL here]

**Solana Program ID:** `3ekPFgdBXUEFQwY1kDqfMpebP68jxba65erehQwcd8zw`

## Project Overview

### Description

GachaDex is a Pokemon-themed Gacha game built on Solana blockchain. The dApp combines the nostalgic appeal of classic Pokemon games with modern blockchain technology, allowing users to collect, manage, and trade Pokemon through a gacha (random draw) system.

The application features a retro-styled user interface reminiscent of classic Pokemon games, complete with pixelated sprites, animated Pokemon, and a PC-style storage system. Users can purchase in-game coins with SOL, perform gacha pulls to obtain random Pokemon with varying rarities, manage their collection, and track their progress through an integrated Pokedex system.

All Pokemon ownership, user data, and transactions are stored on the Solana blockchain, ensuring true ownership and transparency. The game features all 151 Generation 1 Pokemon, each with unique attributes including rarity tiers (R, SR, SSR, UR), shiny variants (5% chance), gender, and worth values.

### Key Features

- **Wallet Integration**: Seamless connection with Solana wallets (Phantom, Solflare, etc.) using wallet-adapter
- **User Registration**: One-time account creation with username, starting with 100 coins as initial balance
- **Coin System**: In-game currency system where 1 coin = 100,000 lamports (0.0001 SOL)
- **Top-Up System**: Purchase coins with SOL through blockchain transactions (6 package options from 5-1000 coins)
- **Gacha Pulls**:
  - Single pull (1x) costs 10 coins
  - Multi pull (10x) costs 100 coins
  - Pokemon rarity distribution: R (75%), SR (20%), SSR (4%), UR (1%)
  - 10% chance for shiny variants
- **Pokemon Collection**:
  - View all owned Pokemon in a PC-style grid interface with paginated display (20 per page)
  - Each Pokemon has unique attributes: ID, name, gender, shiny status, worth value
  - Different background environments that cycle through 12 biome types
- **Pokemon Management**:
  - Rename Pokemon with custom nicknames
  - Release Pokemon to receive coins back based on their worth value
- **Pokedex System**:
  - Track caught Pokemon out of 151 total
  - View locked/unlocked Pokemon with sprite previews
  - Search functionality to find specific Pokemon
- **Animated Home Screen**:
  - Randomized background from 12 biome environments
  - 5 random owned Pokemon floating with independent animations
  - Quick access cards to Pokedex and Gacha features
- **Interactive Modals**:
  - Confirmation modals for purchases and Pokemon release
  - Detailed Pokemon information display with animated sprites
  - Success/error notifications

### How to Use the dApp

1. **Connect Wallet**
   - Visit the deployed frontend URL
   - Click "Select Wallet" and choose your Solana wallet (Phantom, Solflare, etc.)
   - Approve the connection request in your wallet
   - Sign the message to verify ownership

2. **Create Account (First-Time Users)**
   - After connecting, you'll be prompted to create an account
   - Enter a username (max 20 characters)
   - Click "Create Account" button
   - Approve the transaction in your wallet
   - You'll receive 100 coins as a starting bonus

3. **Top Up Coins**
   - Click the "+" button next to your coin balance (top right)
   - Choose from 6 package options (5 to 1000 coins)
   - Each package shows the cost in SOL
   - Click on a package to purchase
   - Approve the transaction in your wallet
   - Your coin balance will update automatically

4. **Perform Gacha Pulls**
   - Navigate to the "GACHA" tab from the bottom navigation
   - View the animated banner showcasing available Pokemon
   - Choose between:
     - **1x Pull**: 10 coins for one Pokemon
     - **10x Pull**: 100 coins for ten Pokemon (10 pulls guaranteed SSR message is for promotional purposes)
   - Click the desired pull button
   - Confirm the transaction in the confirmation modal
   - Wait for the pull to complete (blockchain transaction)
   - Click pokeballs to reveal your Pokemon one by one, or use "OPEN ALL" button
   - Click "OK" when done to close the results

5. **View Your Collection**
   - Navigate to the "OWNED" tab from the bottom navigation
   - Browse your Pokemon in a paginated grid (20 per page)
   - Use PREV/NEXT buttons to navigate between pages
   - Use the search bar to find specific Pokemon by name or nickname
   - Each page displays a different background environment

6. **Manage Pokemon**
   - Click on any Pokemon in your collection to view details
   - In the detail modal, you can:
     - **Rename**: Click "RENAME" button, enter a new nickname, confirm
     - **Release**: Click "RELEASE" button, confirm in the warning modal
   - Released Pokemon return coins based on their worth value
   - All transactions are recorded on the blockchain

7. **Track Progress**
   - Navigate to the "POKEDEX" tab from the bottom navigation
   - View all 151 Generation 1 Pokemon
   - Locked Pokemon appear as black silhouettes
   - Unlocked Pokemon show their actual sprites and names
   - Click on unlocked Pokemon to view detailed information
   - Use the search bar to find specific Pokemon
   - The homepage also shows your progress (X/151)

8. **Homepage Dashboard**
   - Navigate to the "HOME" tab
   - View your Pokemon collection with 5 random Pokemon floating in a dynamic environment
   - Click the animated card to view all owned Pokemon
   - Quick access cards show:
     - **Pokedex**: Your collection progress with visual progress bar
     - **Gacha**: Current coin balance and direct access to pulls

## Program Architecture

The GachaDex program is built using the Anchor framework and follows a modular architecture with separate account structures for users, Pokemon, and game configuration. The program implements a gacha game economy where users purchase coins, perform random draws to obtain Pokemon, and manage their collection through rename and release operations.

### Core Design Principles

1. **User-Centric Design**: Each user has their own UserData PDA storing balance and metadata
2. **True Ownership**: Each Pokemon is a separate PDA account owned by the user
3. **Progress Tracking**: Pokedex PDA tracks which Pokemon IDs the user has caught
4. **Deterministic Addressing**: All accounts use PDAs for predictable address derivation
5. **Economic Model**: Coins are purchased with SOL and spent on gacha pulls; releasing Pokemon returns coins

### PDA Usage

The program extensively uses Program Derived Addresses (PDAs) to create deterministic, user-owned accounts without requiring users to manage private keys for each account.

**PDAs Used:**

1. **UserData PDA**
   - **Seeds**: `["USER_SEED", user_pubkey]`
   - **Purpose**: Stores user profile information and game state
   - **Uniqueness**: One per wallet address
   - **Contains**: Username, bio, Pokemon count, coin balance, user address
   - **Rationale**: Using the user's pubkey as a seed ensures each wallet has exactly one user account, preventing duplicates and providing deterministic address lookup

2. **Pokemon PDA**
   - **Seeds**: `["POKEMON_SEED", user_data_pda, pokemon_count_bytes]`
   - **Purpose**: Represents individual Pokemon owned by a user
   - **Uniqueness**: One per Pokemon instance (multiple accounts for duplicate Pokemon)
   - **Contains**: Pokemon ID, name, owner, gender, shiny status, worth value, bump
   - **Rationale**: Using user_data PDA and pokemon_count ensures each user can have multiple Pokemon with unique, sequential addresses. The count acts as an index preventing collisions.

3. **Pokedex PDA**
   - **Seeds**: `["POKEDEX_SEED", user_pubkey]`
   - **Purpose**: Tracks which Pokemon IDs the user has caught (for Pokedex completion)
   - **Uniqueness**: One per user
   - **Contains**: Vector of Pokemon IDs (1-151) that have been caught
   - **Rationale**: Separate from UserData to optimize space and allow efficient Pokedex queries without loading full user profile

4. **Config/GameAuthority PDA**
   - **Seeds**: `["CONFIG_SEED"]`
   - **Purpose**: Stores global game configuration and authority
   - **Uniqueness**: Single global instance
   - **Contains**: Owner/authority pubkey for admin operations
   - **Rationale**: Global PDA without user-specific seeds allows a single source of truth for game settings and admin control

### Program Instructions

The program implements 7 core instructions covering user management, economy, and Pokemon operations:

**Instructions Implemented:**

1. **`initialize(ctx: Context<InitializeConfig>)`**
   - **Purpose**: One-time initialization of the global game configuration
   - **Accounts**: Creates the Config PDA with authority set to the initializer
   - **Access**: Admin only (typically called once during deployment)
   - **Use Case**: Set up the game authority before any users can interact

2. **`create_user(ctx: Context<InitializeUser>, username: String)`**
   - **Purpose**: Register a new user account and initialize their game state
   - **Accounts Created**:
     - UserData PDA (stores user profile and balance)
     - Pokedex PDA (tracks caught Pokemon)
   - **Validation**: Username must be ≤ 20 characters
   - **Initial State**:
     - Username set to provided value
     - Bio set to default message
     - Pokemon count = 0
     - Balance = 100 coins (starter bonus)
   - **Use Case**: First-time user registration (one-time operation per wallet)

3. **`topup(ctx: Context<TopupBalance>, amount: u64)`**
   - **Purpose**: Purchase in-game coins by transferring SOL to the program
   - **Parameters**: `amount` - number of coins to purchase
   - **Economics**: 1 coin = 100,000 lamports (0.0001 SOL)
   - **Accounts**: Updates UserData balance
   - **Transfer**: Moves lamports from user to Config account
   - **Use Case**: Users buy coins to perform gacha pulls

4. **`withdraw(ctx: Context<Withdraw>, amount: u64)`**
   - **Purpose**: Admin function to withdraw accumulated SOL from the program
   - **Parameters**: `amount` - lamports to withdraw
   - **Access**: Only the game authority can call this
   - **Validation**: Config PDA owner must sign the transaction
   - **Use Case**: Program operator extracts revenue from coin purchases

5. **`gacha(ctx: Context<Gacha>, result: GachaResult)`**
   - **Purpose**: Process a gacha pull and create a new Pokemon
   - **Parameters**: `result` - contains id, is_shiny, gender, worth (determined off-chain)
   - **Cost**: 10 coins per pull
   - **Validation**: User must have ≥ 10 coins
   - **Accounts Created**: New Pokemon PDA with the pulled Pokemon data
   - **Side Effects**:
     - Deducts 10 coins from UserData balance
     - Increments pokemon_count
     - Adds Pokemon ID to Pokedex if not already caught
   - **Use Case**: Main gameplay loop - users spend coins to get random Pokemon

6. **`rename(ctx: Context<RenamePokemon>, name: String)`**
   - **Purpose**: Change a Pokemon's custom nickname
   - **Parameters**: `name` - new nickname (max 20 characters)
   - **Validation**:
     - User must own the Pokemon (Pokemon.owner == signer)
     - Name length ≤ 20 characters
   - **Accounts**: Updates Pokemon.name field
   - **Use Case**: Personalize Pokemon with custom names

7. **`release(ctx: Context<ReleasePokemon>)`**
   - **Purpose**: Delete a Pokemon account and refund coins based on its worth
   - **Validation**: User must own the Pokemon
   - **Economics**: User receives Pokemon.worth coins back
   - **Accounts**:
     - Closes Pokemon PDA (rent refunded to user)
     - Updates UserData balance
     - Decrements pokemon_count
   - **Use Case**: Convert unwanted Pokemon back into coins for more pulls

### Account Structure

```rust
#[account]
pub struct UserData {
    pub address: Pubkey,           // User's wallet address
    pub username: String,          // Display name (max 20 chars)
    pub bio: String,               // User description (max 200 chars)
    pub pokemon_count: u64,        // Total Pokemon owned (used for PDA seeds)
    pub balance: u64,              // Coin balance for gacha pulls
}

#[account]
pub struct Pokemon {
    pub id: u8,                    // Pokemon species ID (1-151)
    pub name: String,              // Pokemon name or custom nickname (max 20 chars)
    pub owner: Pubkey,             // UserData address that owns this Pokemon
    pub gender: Gender,            // Male or Female (enum)
    pub is_shiny: bool,            // Shiny variant flag (10% chance)
    pub worth: u64,                // Coin value refunded when releasing Pokemon
    pub bump: u8,                  // PDA bump seed
}

#[account]
pub struct Pokedex {
    pub ids: Vec<u8>,              // List of caught Pokemon IDs for completion tracking (max 200)
}

#[account]
pub struct GameAuthority {
    pub owner: Pubkey,             // Admin address for withdraw and config operations
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum Gender {
    Male,
    Female,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct GachaResult {
    pub id: u8,                    // Pokemon species ID to create
    pub is_shiny: bool,            // Whether this pull is shiny variant
    pub gender: Gender,            // Gender for this Pokemon
    pub worth: u64,                // Coin value for future release
}
```

## Testing

### Test Coverage

The test suite covers all program instructions with both successful execution paths and error cases. Tests are written in TypeScript using Anchor's testing framework and Mocha.

**Happy Path Tests:**

1. **Initialize Config Test**
   - Description: Verifies that the game configuration can be initialized successfully
   - Validates: Config PDA is created with correct authority

2. **Create User Test**
   - Description: Tests user account creation with valid username
   - Validates:
     - UserData PDA is created with correct data
     - Pokedex PDA is initialized
     - Initial balance is 100 coins
     - Username and bio are set correctly

3. **Top Up Balance Test**
   - Description: Tests purchasing coins with SOL
   - Validates:
     - User balance increases by the correct amount
     - SOL is transferred from user to Config account
     - Transaction completes successfully

4. **Gacha Pull Test**
   - Description: Tests performing a gacha pull with sufficient balance
   - Validates:
     - Pokemon PDA is created with correct attributes
     - User balance decreases by 10 coins
     - Pokemon count increments
     - Pokedex is updated if new species

5. **Rename Pokemon Test**
   - Description: Tests renaming an owned Pokemon
   - Validates:
     - Pokemon name is updated correctly
     - Only owner can rename their Pokemon

6. **Release Pokemon Test**
   - Description: Tests releasing a Pokemon to get coins back
   - Validates:
     - Pokemon account is closed
     - User receives correct coin refund based on worth
     - Pokemon count decrements
     - Rent is refunded to user

**Unhappy Path Tests:**

1. **Create User with Long Username**
   - Description: Attempts to create user with username exceeding 20 characters
   - Expected Error: `NameTooLong` error
   - Validates: Input validation prevents invalid usernames

2. **Gacha with Insufficient Balance**
   - Description: Attempts gacha pull when user has < 10 coins
   - Expected Error: `InsufficientCoins` error
   - Validates: Transaction fails before creating Pokemon account

3. **Rename Pokemon with Long Name**
   - Description: Attempts to rename Pokemon with name > 20 characters
   - Expected Error: `NameTooLong` error
   - Validates: Nickname validation works correctly

4. **Rename Pokemon Not Owned**
   - Description: Attempts to rename a Pokemon owned by another user
   - Expected Error: Account validation error (owner constraint)
   - Validates: Authorization checks prevent unauthorized modifications

5. **Release Pokemon Not Owned**
   - Description: Attempts to release a Pokemon owned by another user
   - Expected Error: Account validation error (owner constraint)
   - Validates: Users cannot release other users' Pokemon

6. **Withdraw by Non-Authority**
   - Description: Attempts withdraw operation with non-owner signer
   - Expected Error: Constraint violation on has_one = owner
   - Validates: Only game authority can withdraw funds

### Running Tests

```bash
# Navigate to the Anchor project directory
cd anchor_project

# Install dependencies
npm install

# Run all tests
anchor test
```

### Additional Notes for Evaluators

In this program I tried to combine the vault and the Tweets system with a unique and fun theme, so I choosed the Retro Pokemon Gacha style. My biggest challenge was trying to make a system where the gas fees would be sponsored by our admin wallet (i failed) since users already paid to buy coins and i dont want them to spent more fees when doing gacha and other instruction. I failed implementing that system but I learned that i would need the keypair of my admin wallet stored in the frontend and that could be fatal. That might work in the backend but since we are not using any backend i stop implementing that system. And while failing to implement that system i learned that we can update the program code to the same address (which i tought was impossible, at least in ethereum) and spent hours debugging an error that was caused by me not updating the idl of the newly deployed program. I also deepen my understanding to the PDA seeds, like how to imitate the one to many, one to one relationship in sql and many other things.

