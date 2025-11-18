use anchor_lang::prelude::*;

use crate::{errors::CustomError, states::*};

pub fn initialize_user(
    ctx: Context<InitializeUser>,
    username: String,
) -> Result<()> {

    let user_data = &mut ctx.accounts.user_data;
    let signer = &mut ctx.accounts.signer;

    if username.as_bytes().len() > USERNAME_LENGTH {
        return Err(CustomError::NameTooLong.into());
    }

    user_data.username = username;
    user_data.bio = String::from("This user has not write anything yet");
    user_data.pokemon_count = 0;
    user_data.balance = 100;
    user_data.address = signer.key();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + UserData::INIT_SPACE,
        seeds = [USER_SEED.as_bytes(), signer.key().as_ref()],
        bump
    )]
    pub user_data: Account<'info, UserData>,
    #[account(
        init,
        payer = signer,
        space = 8 + Pokedex::INIT_SPACE,
        seeds = [POKEDEX_SEED.as_bytes(), signer.key().as_ref()],
        bump
    )]
    pub pokedex: Account<'info, Pokedex>,
    
    pub system_program: Program<'info, System>,
}
