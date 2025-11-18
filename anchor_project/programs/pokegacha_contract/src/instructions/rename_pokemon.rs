use anchor_lang::prelude::*;

use crate::{errors::CustomError, states::*};

pub fn rename_pokemon(
    ctx: Context<RenamePokemon>,
    name : String
) -> Result<()> {

    let signer = &mut ctx.accounts.signer;
    let pokemon = &mut ctx.accounts.pokemon;

    require_eq!(signer.key(), pokemon.owner, CustomError::Unauthorized);    
    if name.as_bytes().len() > USERNAME_LENGTH {
        return Err(CustomError::NameTooLong.into());
    }
    
    pokemon.name = name;
    
    Ok(())
}

#[derive(Accounts)]
pub struct RenamePokemon<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub pokemon: Account<'info, Pokemon>
}
