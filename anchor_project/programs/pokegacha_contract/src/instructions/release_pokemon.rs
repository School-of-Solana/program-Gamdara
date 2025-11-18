use anchor_lang::prelude::*;

use crate::{errors::CustomError, states::*};

pub fn release_pokemon(
    ctx: Context<ReleasePokemon>
) -> Result<()> {

    let signer = &mut ctx.accounts.signer;
    let config = &mut ctx.accounts.config;
    let user_data = &mut ctx.accounts.user_data;
    let pokemon = &mut ctx.accounts.pokemon;

    require_eq!(signer.key(), pokemon.owner, CustomError::Unauthorized);    
    
    user_data.balance += pokemon.worth;

    let _ = pokemon.close(config.to_account_info());
    
    Ok(())
}

#[derive(Accounts)]
pub struct ReleasePokemon<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), signer.key().as_ref()],
        bump
    )]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub pokemon: Account<'info, Pokemon>,
    #[account(
        mut,
        seeds = [CONFIG_SEED.as_bytes()],
        bump
    )]
    pub config: Account<'info, GameAuthority>,
    pub system_program: Program<'info, System>,
}
