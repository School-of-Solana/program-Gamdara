use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction;
use crate::states::*;
use crate::errors::CustomError;

pub fn topup_balance(
    ctx: Context<TopupBalance>,
    amount: u64,
) -> Result<()> {    

    let signer = &mut ctx.accounts.signer;
    let user_data = &mut ctx.accounts.user_data;
    let config = &mut ctx.accounts.config;
    let amount_in_lamport = amount * LAMPORT_PER_COIN;

    msg!("Signer lamports: {}",signer.get_lamports());
    msg!("Amount in lamports: {}",amount_in_lamport);
    require_gte!(signer.get_lamports(), amount_in_lamport, CustomError::InsufficientFunds);
    

    let instructions = system_instruction::transfer(
        &signer.key(), 
        &config.key(), 
        amount_in_lamport
    );

    let _ = invoke(&instructions,
        &[
            signer.to_account_info(), 
            config.to_account_info(), 
        ] 
    );

    user_data.balance += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct TopupBalance<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), signer.key().as_ref()],
        bump
    )]
    pub user_data: Account<'info, UserData>,
    #[account(
        mut,
        seeds = [CONFIG_SEED.as_bytes()],
        bump
    )]
    pub config: Account<'info, GameAuthority>,
    pub system_program: Program<'info, System>,
}
