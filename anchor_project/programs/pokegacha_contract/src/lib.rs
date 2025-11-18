use anchor_lang::prelude::*;
use crate::instructions::*;

declare_id!("3ekPFgdBXUEFQwY1kDqfMpebP68jxba65erehQwcd8zw");

pub mod errors;
pub mod instructions;
pub mod states;

#[program]
pub mod pokegacha_contract {
    use super::*;

    pub fn create_user(ctx: Context<InitializeUser>, username: String) -> Result<()> {
        initialize_user(ctx, username)
    }
    
    pub fn initialize(ctx: Context<InitializeConfig>) -> Result<()> {
        initialize_config(ctx)
    }

    pub fn topup(ctx: Context<TopupBalance>, amount: u64) -> Result<()> {
        msg!("Signer lamports: {}",2);
        topup_balance(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        withdraw_funds(ctx, amount)
    }

    pub fn gacha(ctx: Context<Gacha>, result : states::GachaResult) -> Result<()> {
        save_gacha(ctx, result)
    }

    pub fn release(ctx: Context<ReleasePokemon>) -> Result<()> {
        release_pokemon(ctx)
    }

    pub fn rename(ctx: Context<RenamePokemon>, name: String) -> Result<()> {
        rename_pokemon(ctx, name)
    }

}
