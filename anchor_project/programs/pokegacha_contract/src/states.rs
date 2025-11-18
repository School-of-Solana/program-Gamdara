use anchor_lang::prelude::*;

pub const POKEDEX_LENGTH: u8 = 200;

pub const LAMPORT_PER_COIN: u64 = 1_000_00;
pub const USERNAME_LENGTH: usize = 20;
pub const BIO_LENGTH: usize = 200;

pub const USER_SEED: &str = "USER_SEED";
pub const POKEMON_SEED: &str = "POKEMON_SEED";
pub const POKEDEX_SEED: &str = "POKEDEX_SEED";
pub const CONFIG_SEED: &str = "CONFIG_SEED";


#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub enum Gender {
    Male,
    Female,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub enum GachaType {
    Single,
    Multi,
}

#[account]
#[derive(InitSpace)]
pub struct UserData {
    pub address: Pubkey,
    #[max_len(USERNAME_LENGTH)]
    pub username: String,
    #[max_len(BIO_LENGTH)]
    pub bio: String,
    pub pokemon_count: u64,
    pub balance: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Pokemon {
    pub id: u8,
    #[max_len(USERNAME_LENGTH)]
    pub name: String,
    pub owner: Pubkey,
    pub gender: Gender,
    pub is_shiny: bool,
    pub worth: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Pokedex {
    #[max_len(POKEDEX_LENGTH)]
    pub ids: Vec<u8>,
}

#[account]
#[derive(InitSpace)]
pub struct GameAuthority {
    pub owner: Pubkey,
}   

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct GachaResult {
    pub id : u8,
    pub is_shiny : bool,
    pub gender : Gender,
    pub worth : u64
}