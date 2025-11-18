use anchor_lang::prelude::*;

use crate::states::*;

pub fn initialize_config(
    ctx: Context<InitializeConfig>,
) -> Result<()> {

    let config = &mut ctx.accounts.config;

    config.owner = *ctx.accounts.signer.key;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + GameAuthority::INIT_SPACE,
        seeds = [CONFIG_SEED.as_bytes()],
        bump
    )]
    pub config: Account<'info, GameAuthority>,
    pub system_program: Program<'info, System>,
}
