use anchor_lang::prelude::*;

use crate::{errors::CustomError, states::*};

pub fn save_gacha(
    ctx: Context<Gacha>,
    gacha_result: GachaResult,
) -> Result<()> {

    let user_data = &mut ctx.accounts.user_data;
    let pokemon = &mut ctx.accounts.pokemon;
    let pokedex = &mut ctx.accounts.pokedex;
    let coins_to_deduct = 10; //10 coins per roll

    require_gte!(user_data.balance, coins_to_deduct, CustomError::InsufficientCoins);    

    if !pokedex.ids.contains(&gacha_result.id) {
        pokedex.ids.push(gacha_result.id);
    }

    pokemon.owner = user_data.address;
    pokemon.gender = gacha_result.gender;
    pokemon.id = gacha_result.id;
    pokemon.is_shiny = gacha_result.is_shiny;
    pokemon.worth = gacha_result.worth;
    
    user_data.balance -= coins_to_deduct;
    user_data.pokemon_count += 1;
    
    Ok(())
}

#[derive(Accounts)]
pub struct Gacha<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub user_data: Account<'info, UserData>,
    #[account(
        mut,
        seeds = [POKEDEX_SEED.as_bytes(), &user_data.address.as_ref()],
        bump
    )]
    pub pokedex: Account<'info, Pokedex>,
    #[account(
        init,
        payer = owner,
        space = 8 + Pokemon::INIT_SPACE,
        seeds = [POKEMON_SEED.as_bytes(), user_data.key().as_ref(), &user_data.pokemon_count.to_le_bytes()],
        bump
    )]
    pub pokemon: Account<'info, Pokemon>,
    pub system_program: Program<'info, System>,
}
