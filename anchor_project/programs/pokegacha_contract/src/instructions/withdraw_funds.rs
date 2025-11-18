use anchor_lang::prelude::*;
use crate::{errors::CustomError, states::*};

pub fn withdraw_funds(
    ctx: Context<Withdraw>,
    amount: u64,
) -> Result<()> {

    let owner = &mut ctx.accounts.owner;
    let config = &mut ctx.accounts.config;

    require_gte!(config.get_lamports(), amount, CustomError::InsufficientFunds);

    **owner.try_borrow_mut_lamports()? += amount;
    let _ = config.sub_lamports(amount);

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED.as_bytes()],
        has_one = owner,
        bump,
    )]
    pub config: Account<'info, GameAuthority>,
    pub system_program: Program<'info, System>,
}
